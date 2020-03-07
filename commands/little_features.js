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
    let give_regex = new RegExp("^" + prefix + "give <@.?[0-9]+> .*?$");

    if(give_regex.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    

      let user = await assist_func.id_to_name(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
      let item = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length).trim();

      let embed = new Discord.MessageEmbed()
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
    let how_regex = new RegExp("^" + prefix + "how <@.?[0-9]+> .*?$");
    let how_me = new RegExp("^" + prefix + "how .*?$");
    let how_something = new RegExp("^" + prefix + "how .*? (is|are|am) .*?$", "g");

    if(how_regex.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    

      let user = await assist_func.id_to_name(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
      let how_query = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length).trim();

      let embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " wonders how -" + how_query + "- is " + user + ".")
        .setDescription("They are " + Math.floor((Math.random() * 100) + 0) + "% " + how_query + ".");

      msg.channel.send(embed);

    }else if(how_something.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    

      let how = "";
      let something = "";
      let be = "";

      if(msg.content.includes(" is ")){
        how = msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.indexOf(" is ")).trim();
        something = msg.content.slice(msg.content.indexOf(" is ") + 3, msg.content.length).trim();
        be = "is";
      }

      if(msg.content.includes(" are ")){
        how = msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.indexOf(" are ")).trim();
        something = msg.content.slice(msg.content.indexOf(" are ") + 4, msg.content.length).trim();
        be = "are";
      }

      if(msg.content.includes(" am ")){
        how = msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.indexOf(" am ")).trim();
        something = msg.content.slice(msg.content.indexOf(" am ") + 3, msg.content.length).trim();
        be = "am";
      }

      how = await assist_func.id_to_name(how, client, msg);
      something = await assist_func.id_to_name(something, client, msg);

      let embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " wonders.. How -" + how + "- " + be + " -" + something + "- ?")
        .setDescription(something + " "+ be + " " + Math.floor((Math.random() * 100) + 0) + "% " + how + ".");

      msg.channel.send(embed);

    }else if(how_me.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;

      let how_query = msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim();
      how_query = await assist_func.id_to_name(how_query, client, msg);

      let embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.author.username + " ponders to themselves, how -" + how_query + "- are they?")
        .setDescription("They are " + Math.floor((Math.random() * 100) + 0) + "% " + how_query + ".");

      msg.channel.send(embed);

    }
  },

  /**
   * @name eight_ball(...)
   * 
   * @description : Grabs pre-written answers from json and sends it as a response to the command
   * 
   * @param {String} prefix 
   * @param {MESSAGE} msg 
   */
  eight_ball: function(prefix, msg){
    //ask a question and it shall answer my guy
    let ask_8 = new RegExp("^" + prefix + "ask8 .*?$");

    if(ask_8.test(msg.content.toLowerCase())){
      if(assist_func.userTimeOut(msg) == true || msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim() == "") return;

      msg.react('🎱');

      let embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour())
        .setAuthor(msg.author.username + " asked a question...", msg.author.avatarURL)
        .setDescription(eight_ball.magic_answers[Math.floor((Math.random() * eight_ball.magic_answers.length) + 0)])
        .setFooter("Only yes or no questions please. I am not that smart.");

      msg.channel.send(embed);
    }
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
    let whichone = new RegExp("^" + prefix + "pick .*? (.or) .*?", "g");

    if(whichone.test(msg.content.toLowerCase())){
      let pick_array = msg.content.split('.or');

      if(assist_func.userTimeOut(msg) == true || msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim() == "") return;

      let final_pick = await assist_func.id_to_name(pick_array[Math.floor((Math.random() * pick_array.length) + 0)], client, msg);
      final_pick = final_pick.replace("%pick", "").trim();

      let embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour())
        .setAuthor(msg.author.username + " asks me to pick...", msg.author.avatarURL)
        .setDescription("I pick `" + final_pick + "`")
        .setFooter("-1 || 0 = " + Math.floor((Math.random() * 2) + 0) + "-");

      msg.channel.send(embed);
    }else if(msg.content.toLowerCase() == prefix + "pick"){
      if(assist_func.userTimeOut(msg) == true || msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim() == "") return;

      let embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour())
        .setAuthor(msg.author.username + " wonders, 0 or 1?", msg.author.avatarURL)
        .setDescription("I flip numbers and it's `*" + Math.floor((Math.random() * 2) + 0) + "*`");

      msg.channel.send(embed);
    }
  },

  /**
   * 
   * Help.
   * 
   */
  help_mora: function(prefix, msg, client){
    if(msg.content == prefix + "help") {
      let embed = new Discord.MessageEmbed()
        .setColor("#d65aa6")
        .setThumbnail(client.user.avatarURL)
        .setTitle("click me.")
        .setDescription("A list of commands for Mora.\nEnjoy.")
        .setURL("https://github.com/Metab0i/Mora--bot/blob/master/README.md")
        .setFooter("🐍")
      msg.channel.send(embed);
    }
  }
} 
