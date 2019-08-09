const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./json files/settings.json');

//File imports
const stubs = require('./commands/stubs');
const distort_text = require('./commands/distort_text');
const db_functions = require('./commands/database');
const yt = require('./commands/youtube');
const wiki = require('./commands/wiki');

//prefix
const prefix = "%";

//DB essentials (psql)
const Pool = require('pg').Pool;

var config = {
  host: 'DB_Address',
  user: 'user_name',
  password: 'p@ssword',
  database: 'db_name'  
};

const pool = new Pool(config);

/**
 * Event: On activation
 * Functionality: runs essentials on activation (such as validating data against database to make sure everything is up to date)
 */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.channels.get();
  client.user.setStatus("online");
  client.user.setActivity(client.guilds.size + ' SVRs|@ me.', { type: 'WATCHING' });
});

/**
 * Event: On join 
 * Functionality: emits when joins a guild
 */
client.on("guildCreate", function(guild){
  db_functions.gatherData(guild, pool);
});

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
  if(msg.author == '<@360790875560869889>' && msg.content.includes('!getInfo')) {
    msg.channel.send("`Refreshing data.`");
    db_functions.gatherData(msg.guild, pool);
  }

  stubs.logResponse(prefix,msg,pool);
  stubs.deleteStubs(prefix,msg,pool);
  stubs.outputStubs(prefix,msg,pool);
  stubs.showStats(prefix, msg, pool);

  distort_text.distortText(prefix, msg);
  yt.init_ysearch(prefix, msg);
  wiki.wiki_search(prefix, msg);
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