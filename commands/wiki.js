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
    var wiki = new RegExp("^" + prefix + "wiki .*?");

    if(wiki.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      //define pages and filters
      let pages = [];

      //grab a request for a wiki page to find
      var query = encodeURIComponent(msg.content.slice(msg.content.indexOf(" "), msg.content.length));

      var request = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + query + "&format=json";
      var options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };
      
      try{
        var result = await rp(options);
      }catch(err){
        return console.error('Error executing query', err.stack);
      }

      //checking if search was successful
      if(result[3].length == 0) return msg.channel.send("`Invalid search, try again.`"); 
      
      for(var wiki_iter in result[3]){
        pages.push("• `Command user: " + msg.author.username + "`\n" + result[3][wiki_iter] + "\n〈 `page: " + (parseInt(wiki_iter)+1) + " of " + result[3].length + "` 〉");
      }

      msg.channel.stopTyping();
      assist_func.createIntList(msg,pages);
    }

  }

}