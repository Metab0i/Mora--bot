const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const feelings = require("../json files/feelings.json");
const eight_ball = require("../json files/8ball_answers.json");

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

      var user = await assist_func.id_to_name(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
      var item = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length).trim();

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " gave -" + item + "- to " + user + ".")
        .setDescription("That makes them feel " + feelings.emotions[Math.floor((Math.random() * feelings.emotions.length) + 0)]);

      msg.channel.send(embed);
    }
  },

  /**
   * @name how(...)
   * 
   * @description : Let's find out how much % something or someone is
   * 
   * @param {String} prefix 
   * @param {CLIENT} client 
   * @param {MESSAGE} msg 
   */
  how: async function(prefix, client, msg){
    //e.g. "how <user> <cool/weird/happy/sad>" -> returns a percentage or something of that manner
    var how_regex = new RegExp("^" + prefix + "how <@.?[0-9]+> .*?$");
    var how_me = new RegExp("^" + prefix + "how .*?$");
    var how_something = new RegExp("^" + prefix + "how .*? (iz) .*?", "g");

    if(how_regex.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    

      var user = await assist_func.id_to_name(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
      var how_query = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length).trim();

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " wonders how -" + how_query + "- is " + user + ".")
        .setDescription("They are " + Math.floor((Math.random() * 100) + 0) + "% " + how_query + ".");

      msg.channel.send(embed);

    }else if(how_something.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    

      var how = msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.indexOf("iz")).trim();
      var something = msg.content.slice(msg.content.indexOf("iz") + 2, msg.content.length).trim(); 

      how = await assist_func.id_to_name(how, client, msg);
      something = await assist_func.id_to_name(something, client, msg);

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " wonders.. How -" + how + "- iz -" + something + "- ?")
        .setDescription(something + " iz " + Math.floor((Math.random() * 100) + 0) + "% " + how + ".");

      msg.channel.send(embed);

    }else if(how_me.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;

      var how_query = msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim();
      how_query = await assist_func.id_to_name(how_query, client, msg);

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " ponders to themselves, how -" + how_query + "- are they?")
        .setDescription("They are " + Math.floor((Math.random() * 100) + 0) + "% " + how_query + ".");

      msg.channel.send(embed);

    }
  },

  eight_ball: function(prefix, msg){
    //ask a question and it shall answer my guy
    var ask_8 = new RegExp("^" + prefix + "ask8 .*?$");

    if(ask_8.test(msg.content.toLowerCase())){
      if(assist_func.userTimeOut(msg) == true || msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim() == "") return;

      msg.react('🎱');

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setAuthor(msg.author.username + " asked a question...", msg.author.avatarURL)
        .setDescription(eight_ball.magic_answers[Math.floor((Math.random() * eight_ball.magic_answers.length) + 0)])
        .setFooter("Only yes or no questions please. I am not that smart.");

      msg.channel.send(embed);
    }
  },

  hello_goodbye: function(prefix, msg){
    //react with an emoji on specific message, E.g. goodnight -> moon emoji. Make a json file full of various messages and emoji responses 
  },

  /**
   * @name this_or(...)
   * 
   * @description : can't pick? This command will help you do just that.
   * 
   * @param {String} prefix 
   * @param {MESSAGE} msg 
   * @param {CLIENT} client 
   */
  this_or: async function(prefix, msg, client){
    var whichone = new RegExp("^" + prefix + "pick .*? (or) .*?", "g");

    if(whichone.test(msg.content.toLowerCase())){
      var pick_array = msg.content.split('or');

      if(assist_func.userTimeOut(msg) == true || msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim() == "") return;

      var final_pick = await assist_func.id_to_name(pick_array[Math.floor((Math.random() * pick_array.length) + 0)], client, msg);
      final_pick = final_pick.replace("%pick", "").trim();

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setAuthor(msg.author.username + " asks me to pick...", msg.author.avatarURL)
        .setDescription("I pick `" + final_pick + "`")
        .setFooter("-1 || 0 = " + Math.floor((Math.random() * 2) + 0) + "-");

      msg.channel.send(embed);
    }else if(msg.content.toLowerCase() == prefix + "pick"){
      if(assist_func.userTimeOut(msg) == true || msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim() == "") return;

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setAuthor(msg.author.username + " wonders, 0 or 1?", msg.author.avatarURL)
        .setDescription("I flip numbers and it's `*" + Math.floor((Math.random() * 2) + 0) + "*`");

      msg.channel.send(embed);
    }
  }
} 
