const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const feelings = require("../json files/feelings.json")

module.exports = {
  give: async function(prefix, client, msg){
    var give_regex = new RegExp("^" + prefix + "give <@.?[0-9]+> .*?$");

    if(give_regex.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    
      msg.channel.startTyping();

      var user_id = msg.content.slice(msg.content.indexOf("@")+1, msg.content.indexOf(">")).replace(/\D/g,'');
      var item = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length);

      try{
        var user = await client.fetchUser(user_id);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      user = user.username;

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        //.setAuthor(msg.author.username)
        .setTitle(msg.author.username + " gave -" + item + "- to " + user + ".")
        .setDescription("That makes them feel " + feelings.emotions[Math.floor((Math.random() * feelings.emotions.length) + 0)]);

      msg.channel.stopTyping();
      msg.channel.send(embed);
    }
  },

  how: async function(prefix, client, msg){
    
  }
} 
