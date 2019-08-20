const Discord = require('discord.js');
const rp = require('request-promise');
const assist_func = require('../commands/assist_functions');
const reddit_auth = require('../json files/reddit_auth.json');

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
          msg.channel.stopTyping();
          return msg.channel.send("`Wrong category, try again.`");
      }

      var options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };

      try{
        var result = await rp(options);
      }catch(err){
        return console.error('Error executing query', err.stack);
      }

      result = result.data['children'][Math.floor((Math.random() * 80) + 0)];

      embed.setTitle(result.data['title'])
           .setURL(reddit + result.data['permalink'])
           .setAuthor("r/copypasta")
           .setDescription(result.data['selftext'].length <= 2047 ? (result.data['selftext'] == "" ? result.data['title'] : result.data['selftext']) : result.data['selftext'].slice(0, 2044) + "...");
      
      msg.channel.stopTyping();
      msg.channel.send(embed);
    }
  },

  update_ad: async function(prefix, msg){
    var up_ad = new RegExp("^" + prefix + "srvbump");

    if(up_ad.test(msg.content.toLowerCase())){
      var reddit = "https://www.reddit.com/api/v1/access_token";
      
      var options = {
        method: 'POST',
        uri: reddit + "?" + reddit_auth.token_request_url,
        headers: {
          'Authorization': "Basic " + reddit_auth.token_auth
        },

        body: {
            data: reddit_auth.token_request_data
        },

        json: true // Automatically stringifies the body to JSON
      };

      try{
        var result = await rp(options);
      }catch(err){
        return console.error('Error executing query', err.stack);
      }

      console.log(JSON.stringify(result) + "\n\n");

      var options_submit = {
        url: 'https://oauth.reddit.com/api/submit' + '?kind=self&sr=reddit_api_deinsect&title=more%20test&text=hello%20world', //make sure to encode it and change Kind param. api docs
        method: 'POST',
        headers: {
            'Authorization': 'bearer '+ result.access_token,
            'user-agent': reddit_auth.user_agent
        }
       
      }

      try{
        var result_submit = await rp(options_submit);
      }catch(err){
        return console.error('Error executing query', err.stack);
      }

      msg.channel.send('```' + JSON.stringify(result_submit) + '```');
      console.log(result_submit);

    }
  }

}
