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

      //list-through pages var pre-set
      let pages = [];
      let page = 1;
      const backwardsFilter = (reaction, usr) => reaction.emoji.name === '⏪' && usr.id === msg.author.id;
      const forwardsFilter = (reaction, usr) => reaction.emoji.name === '⏩' && usr.id === msg.author.id;

      //grab a request for a video to find and URI
      var query = encodeURIComponent(msg.content.slice(msg.content.indexOf(" "), msg.content.length));

      var request = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&order=relevance&q=" + query + "&safeSearch=none&type=video&key=" + API_token.youtube_token;
      var options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };

      var result = await rp(options);

      if(result.items.length == 0) return msg.channel.send("`Invalid search, try again.`")
      
      //var link = "https://www.youtube.com/watch?v=" + result.items[0].id.videoId;
      var link = "https://www.youtube.com/watch?v=";

      for(var vod_id in result.items){
        pages.push("`Command user: " + msg.author.username + "`\n" + link + result.items[vod_id].id.videoId + "\n`page: " + (parseInt(vod_id)+1) + "`");
      }

      msg.channel.stopTyping();
      msg.channel.send(pages[0]).then(msg_pages =>{
        msg_pages.react('⏪').then( r => {
          msg_pages.react('⏩');

          //create 2 collectors of reactions, set filters ^
          const backwards = msg_pages.createReactionCollector(backwardsFilter, { time: 120000 });
          const forwards = msg_pages.createReactionCollector(forwardsFilter, { time: 120000 }); 

          //on action, change the values:
          backwards.on('collect', r => { 
            msg_pages.reactions.forEach(function(value){
              value.remove(msg.author.id);
            })

            if (page === 1) return; 

            page--; 

            msg_pages.edit(pages[page-1]); 
          })
          
          //on action change the values:
          forwards.on('collect', r => { 
            msg_pages.reactions.forEach(function(value){
              value.remove(msg.author.id);
            })
            
            if (page === pages.length && pages.length != 1) return;

            if (pages.length != 1){
              page++;
            } 
  
            msg_pages.edit(pages[page-1]); 
          });
        });
      });
    }
  }
};