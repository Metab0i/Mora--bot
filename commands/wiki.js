const Discord = require('discord.js');
const rp = require('request-promise');
const assist_func = require('../commands/assist_functions');

module.exports ={
  /**
   * @name wiki_search(...)
   * 
   * @param {String} prefix 
   * @param {Message} msg 
   * 
   * @description : Searches a wiki article based on a query
   */
  wiki_search: async function(prefix, msg){
    let wiki = new RegExp("^" + prefix + "wiki .*?");

    if(wiki.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      //define pages and filters
      let pages = [];

      //grab a request for a wiki page to find
      let query = encodeURIComponent(msg.content.slice(msg.content.indexOf(" "), msg.content.length));
      let result;

      let request = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + query + "&format=json";
      let options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };
      
      try{
        result = await rp(options);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack); 
      }

      //checking if search was successful
      if(result[3].length == 0){
        msg.channel.stopTyping();
        return msg.channel.send("`Invalid search, try again.`"); 
      }      

      for(let wiki_iter in result[3]){
        pages.push("• `Command user: " + msg.author.username + "`\n" + result[3][wiki_iter] + "\n〈 `page: " + (parseInt(wiki_iter)+1) + " of " + result[3].length + "` 〉");
      }

      msg.channel.stopTyping();
      assist_func.createIntList(msg,pages);
    }

  }

}