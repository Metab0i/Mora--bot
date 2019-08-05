const Discord = require('discord.js');
const API_token = require('../json files/settings.json');
const rp = require('request-promise');
const assist_func = require('../commands/assist_functions');

module.exports = {

  /**
   * @name init_ysearch(...)
   * 
   * @param {String} prefix 
   * @param {Message} msg 
   * 
   * @description : Allows for in-chat video search 
   * @note : add an ability to list through videos (total of 25 results)
   */
  init_ysearch: async function(prefix, msg){

     //RegEx definition
    var vod = new RegExp("^" + prefix + "vod .*?");

    if(vod.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      //grab a request for a video to find and URI
      var query = encodeURIComponent(msg.content.slice(msg.content.indexOf(" "), msg.content.length));

      var request = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&order=relevance&q=" + query + "&safeSearch=none&type=video&key=" + API_token.youtube_token;
      var options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };

      var result = await rp(options);
      var link = "https://www.youtube.com/watch?v=" + result.items[0].id.videoId;

      msg.channel.stopTyping();
      msg.channel.send(link);

    }
  }
};