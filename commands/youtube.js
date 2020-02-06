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
    let vod = new RegExp("^" + prefix + "vod .*?");

    if(vod.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      //list-through pages let pre-set
      let pages = [];

      //grab a request for a video to find and URI
      let query = encodeURIComponent(msg.content.slice(msg.content.indexOf(" "), msg.content.length));
      let result;

      let request = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&order=relevance&q=" + query + "&safeSearch=none&type=video&key=" + API_token.youtube_token;
      let options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };

      try{
        result = await rp(options);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack); 
      }

      if(result.items.length == 0) return msg.channel.send("`Invalid search, try again.`");
      
      let link = "https://www.youtube.com/watch?v=";

      for(let vod_id in result.items){
        pages.push("• `Command user: " + msg.author.username + "`\n" + link + result.items[vod_id].id.videoId + "\n- `page: " + (parseInt(vod_id)+1) + " of " + result.items.length + "` +");
      }

      msg.channel.stopTyping();
      assist_func.createIntList(msg, pages);
    }
  }
};