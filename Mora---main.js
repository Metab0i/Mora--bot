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

//prefix
const prefix = "%";

//DB essentials (psql)
const Pool = require('pg').Pool;
const pool = new Pool(settings.db_details);

//console.error overload
const fs = require('fs');
const log_file = fs.createWriteStream(__dirname + '/error.log', {flags : 'w'});
const log_stdout = process.stdout;

console.error = function(start_err, err_body) { //
  log_file.write(start_err + ':\n' + err_body + "\n" + "-".repeat(10) + "\n");
  log_stdout.write(start_err + ':\n' + err_body + "\n" + "-".repeat(10) + "\n");
};

/**
 * Event: On acti
 * images.super_hot(prefix, msg, client);tion
 * Functionality: runs essentials on activation (such as validating data against database to make sure everything is up to date)
 */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.channels.get();
  client.user.setStatus("online");
  client.user.setActivity(client.guilds.size + ' SVRs|%help.', { type: 'WATCHING' });
});

/**
 * Event: On join 
 * Functionality: emits when joins a guild
 */
client.on("guildCreate", function(guild){
  db_functions.gatherData(guild, pool);
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
client.on('message', msg => {
  if(msg.author == '<@360790875560869889>' && msg.content.includes('%getInfo')) {
    msg.channel.send("`Refreshing data.`");
    db_functions.gatherData(msg.guild, pool);
  }

  //console.log(msg.embeds);

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
  if(msg.author == '<@360790875560869889>') reddit.update_ad(prefix, msg, client.user.id);
});

client.login(settings.token);



/**
 * NOTES:
 * 
 * request is for future programmatic website interaction. Keep it. 
 * if it's useless then just remove it using: npm uninstall request -g --save and then npm uninstall request --save-dev
 * 
 * 
 */