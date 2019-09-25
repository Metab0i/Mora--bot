const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const feelings = require("../json files/feelings.json")

module.exports = {
  /**
   * @name give(...)
   * 
   * @description: Give someone something and see them react to it
   * 
   * @param {String} prefix 
   * @param {CLIENT} client 
   * @param {MESSAGE} msg 
   */
  give: async function(prefix, client, msg){
    var give_regex = new RegExp("^" + prefix + "give <@.?[0-9]+> .*?$");

    if(give_regex.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    
      msg.channel.startTyping();

      var user_id = msg.content.slice(msg.content.indexOf("@")+1, msg.content.indexOf(">")).replace(/\D/g,'');
      var item = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length).trim();

      try{
        var user = await client.fetchUser(user_id);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      user = user.username;

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " gave -" + item + "- to " + user + ".")
        .setDescription("That makes them feel " + feelings.emotions[Math.floor((Math.random() * feelings.emotions.length) + 0)]);

      msg.channel.stopTyping();
      msg.channel.send(embed);
    }
  },

  how: async function(prefix, client, msg){
    //e.g. "how <user> <cool/weird/happy/sad>" -> returns a percentage or something of that manner
    var how_regex = new RegExp("^" + prefix + "how <@.?[0-9]+> .*?$");
    var how_me = new RegExp("^" + prefix + "how .*?$");

    if(how_regex.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    
      msg.channel.startTyping();

      var user_id = msg.content.slice(msg.content.indexOf("@")+1, msg.content.indexOf(">")).replace(/\D/g,'');
      var how_query = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length).trim();

      try{
        var user = await client.fetchUser(user_id);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      user = user.username;

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " wonders how -" + how_query + "- is " + user + ".")
        .setDescription("They are " + Math.floor((Math.random() * 100) + 0) + "% " + how_query + ".");

      msg.channel.stopTyping();
      msg.channel.send(embed);

    }else if(how_me.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    
      msg.channel.startTyping();

      var how_query = msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim();

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " ponders to themselves, how -" + how_query + "- they are?")
        .setDescription("They are " + Math.floor((Math.random() * 100) + 0) + "% " + how_query + ".");

      msg.channel.stopTyping();
      msg.channel.send(embed);

    }
  },

  eight_ball: function(prefix, msg){
    //ask a question and it shall answer my guy
  },

  hello_goodbye: function(prefix, msg){
    //react with an emoji on specific message, E.g. goodnight -> moon emoji. Make a json file full of various messages and emoji responses 
  },

  user_stats: function(prefix, msg, client){
    //give some info about a user , if no user specified, give info about command caller
  },

  guild_stats: function(prefix, msg){
    //give some info about the server where the command was called
  },

  pfp: function(prefix, msg, client){
    //show a profile picture of the user 
  }
} 
