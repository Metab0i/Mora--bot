const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./json files/settings.json');

//File imports
const stubs = require('./commands/stubs');
const distort_text = require('./commands/distort_text');
const db_functions = require('./commands/database');
const yt = require('./commands/youtube');
const wiki = require('./commands/wiki');
const reddit = require('./commands/reddit');
const little_features = require('./commands/little_features');
const images = require('./commands/images');
const uwu_fier = require('./commands/uwu_fier');
const stomp_user = require('./commands/stomp');
const muda_user = require('./commands/muda');
const ora_user = require('./commands/ora');
const sounds = require('./commands/soundboard');
const stats = require('./commands/stats_commands');
const poll = require('./commands/poll');
const assist_func = require('./commands/assist_functions')
const ascii_image = require('./commands/ascii_image');
const comments = require('./commands/dev_comments');
const funny_ad = require('./commands/generate_ad');
const fortune_teller = require('./commands/fortune_teller');

//prefix
const prefix = "%";

//DB essentials (psql)
const Pool = require('pg').Pool;
const pool = new Pool(settings.db_details);

//console.error overload and essentials
let total_errors = 0;

const fs = require('fs');
const log_file = fs.createWriteStream(__dirname + '/error.log', {flags : 'w'});
const log_stdout = process.stdout;

console.error = function(start_err, err_body) { //
  total_errors += 1;
  log_file.write(start_err + ':\n' + err_body + "\n" + "-".repeat(10) + "\n");
  log_stdout.write(start_err + ':\n' + err_body + "\n" + "-".repeat(10) + "\n");  
};

/**
 * Event: On action
 * images.super_hot(prefix, msg, client);
 * Functionality: runs essentials on activation (such as validating data against database to make sure everything is up to date)
 */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setStatus("online");
  client.user.setActivity('for your commands.', { type: 'WATCHING' });
});

/**
 * Event: On join 
 * Functionality: emits when joins a guild
 */
client.on("guildCreate", function(guild){
  db_functions.gatherData(guild, pool);
  let state = false;
  guild.channels.cache.array().forEach(channel => {
    if(channel.type == "text" && state == false){
      channel.send("Hi, I am Mora. Type `%help` to get started.");
      state = true;
    }
  })

  guild.owner.send("Be sure to position my role above all other roles, otherwise -Reputation- feature wont work properly.");
});

client.on("guildDelete", function(guild){
  db_functions.removeGuild(guild, pool);
})

/**
 * Events: channel create, delete
 * Functionality: every time a channel gets created or deleted, it emits a call to a function
 */

client.on("channelDelete", function(channel){
  db_functions.deleteChannel(pool, channel);
});

client.on("channelCreate", function(channel){
  db_functions.addChannel(pool, channel);
});

/**
 * Event: On message
 * Functionality: Proceeds to produce an output every time an appropriate command was executed in a text chat. 
 */
client.on('message', async msg => {

  //if isn't a part of the guild or is a bot or message isn't a command, proceed to stop.
  const check_command = new RegExp("^" + prefix + ".*?");
  if((msg.member == null || msg.author.bot == true) || check_command.test(msg.content) == false) return;

  //db force gather
  if(msg.author.id == '360790875560869889' && msg.content == '%reload') {
    msg.channel.send("`Reloading data...`");

    db_functions.gatherData(msg.guild, pool);

    const status = await msg.channel.send("`Complete, check bot status.`");
    status.delete(500);
  }

  //db force gather all records
  if(msg.author.id == '360790875560869889' && msg.content == '%reload all') {
    msg.channel.send("`Reloading db...`");

    client.guilds.forEach(async guild =>{
      db_functions.gatherData(guild, pool)

      const status = await msg.channel.send("`Complete, check bot status.`");
      status.delete(500);
    })
  }

  //send an error to app owner
  if(msg.author.id == '360790875560869889' && msg.content.includes("%errlog")){
    msg.react("👨‍💻")
    assist_func.notify_of_error("360790875560869889", client, "../Mora Bot/error.log");
    msg.delete({timeout: 6500});
  }

  //reddit ad update
  if(msg.author.id == '360790875560869889') reddit.update_ad(prefix, msg, client.user.id);

  comments.set_channel(prefix, msg);
  comments.leave_comment(prefix, msg);

  funny_ad.gen_ad(prefix, msg);
  fortune_teller.fortune(prefix, msg);

  stubs.logResponse(prefix,msg,pool);
  stubs.deleteStubs(prefix,msg,pool);
  stubs.outputStubs(prefix,msg,pool);
  stubs.showStats(prefix,msg,pool);

  distort_text.distortText(prefix, msg);
  yt.init_ysearch(prefix, msg);
  wiki.wiki_search(prefix, msg);

  little_features.give(prefix, client, msg);
  little_features.how(prefix, client, msg);
  little_features.eight_ball(prefix, msg);
  little_features.this_or(prefix, msg, client);
  little_features.help_mora(prefix, msg, client);

  //images
  images.hug(prefix, msg, client);
  images.super_hot(prefix, msg, client);

  //gifs
  stomp_user.stomp(prefix, msg, client);
  muda_user.muda(prefix, msg, client);
  ora_user.ora(prefix, msg, client);

  uwu_fier.uwu_fier(prefix, msg);

  reddit.serve_reddit(prefix, msg);

  sounds.soundboard(prefix, msg);

  stats.server_stats(prefix, msg);
  stats.bot_stats(prefix, msg, client, total_errors);

  poll.poll(prefix, msg, client);

  ascii_image.ascii_image(prefix, msg);
});

client.login(settings.token);