const Discord = require('discord.js');
const assist_func = require('./assist_functions');

module.exports = {
  give: async function(prefix, msg){
    var give_regex = new RegExp("^" + prefix + "give <@.?[0-9]+> .*?$");
    if(give_regex.test(msg.content.toLowerCase())){
      msg.channel.startTyping();

      var embed = new Discord.RichEmbed()
        .setColor('#72ba8a')
        .setAuthor(msg.author.name)
        .setTitle()
    }
  } 
} 
