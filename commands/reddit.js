const Discord = require('discord.js');
const API_token = "";
const rp = require('request-promise');
const assist_func = require('../commands/assist_functions');

module.exports = {

  /**
   * @name serve_pasta(...)
   * 
   * @param {String} prefix 
   * @param {Message} msg 
   * 
   * @description : posts a random copypasta from r/copypasta sub-reddit.
   */
  serve_pasta: async function(prefix, msg){
    var pasta = new RegExp("^" + prefix + "pasta .*?");

    if(pasta.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      var embed = new Discord.RichEmbed()
        .setColor('#f4ef88');

      var reddit = "https://www.reddit.com";
      var query = msg.content.slice(msg.content.indexOf(" "), msg.content.length).replace(/\s/g, "");

      var request = "";

      switch(query.toLowerCase()) {
        case "top":
          request = reddit + "/r/copypasta/top/.json?limit=80";
          break;
        case "new":
          request = reddit + "/r/copypasta/new/.json?limit=80";
          break;
        case "hot":
          request = reddit + "/r/copypasta/hot/.json?limit=80";
          break;
        case "controversial":
          request = reddit + "/r/copypasta/controversial/.json?limit=80";
          break;
        case "rising":
          request = reddit + "/r/copypasta/rising/.json?limit=80";
          break;
        default:
          msg.channel.send("`Wrong category, try again.`");
      }

      var options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };

      var result = await rp(options);
      result = result.data['children'][Math.floor((Math.random() * 80) + 0)];

      embed.setTitle(result.data['title'])
           .setURL(reddit + result.data['permalink'])
           .setAuthor("r/copypasta")
           .setDescription(result.data['selftext'].length <= 2047 ? (result.data['selftext'] == "" ? result.data['title'] : result.data['selftext']) : result.data['selftext'].slice(0, 2044) + "...");
      
      msg.channel.stopTyping();
      msg.channel.send(embed);
    }
  }

}