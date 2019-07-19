const Discord = require('discord.js');
const client = new Discord.Client();

//File imports
const messages = require('./commands/messages');
const db_functions = require('./commands/database');
const settings = require('./json files/settings.json');

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

  //db_functions.updateGuildName(client, pool);
});

/**
 * Event: On join 
 * Functionality: emits when joins a guild
 */
client.on("guildCreate", function(guild){
  db_functions.gatherData(guild, pool);
});

/**
 * Event: On guild update
 * Functionality: every time a guild gets updated
 */
client.on("guildUpdate", function(oldGuild, newGuild){
  //db_functions.updateGuildName(client, pool, newGuild);
});

/**
 * Events: channel update, create, delete
 * Functionality: every time a channel gets created, updated or deleted, it emits a call to a function
 */
client.on("channelUpdate", function(oldChannel, newChannel){
  //console.log(`channelUpdate -> a channel is updated - e.g. name change, topic change`);
  //db_functions.updateChannelName(client, pool, oldChannel, newChannel);
});

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

  messages.distortText(client, msg);

  messages.logResponse(client,msg,pool);
  messages.deleteStubs(client,msg,pool);
  messages.outputStubs(client,msg,pool);
  messages.showStats(client, msg, pool);
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