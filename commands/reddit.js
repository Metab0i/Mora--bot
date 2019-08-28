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
    var up_ad = new RegExp("^" + prefix + "gdbump <#.?[0-9]+> .*?$");

    if(up_ad.test(msg.content.toLowerCase())){
      msg.channel.startTyping();

      var reddit = "https://www.reddit.com/api/v1/access_token";

      var channel_id = msg.content.slice(msg.content.indexOf("#")+1, msg.content.indexOf(">"));
      var title = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length);
      
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
        var invites = await msg.guild.fetchInvites();

        for(var i = 0; i < invites.array().length; i++){
          invites.array()[i].delete();
        }

        var result = await rp(options);
        var invite_link = await msg.guild.channels.get(channel_id).createInvite({
          maxAge: 0,
          maxUses: 0
        });
      }catch(err){
        return console.error('Error executing query', err.stack);
      }

      var options_submit = {
        url: 'https://oauth.reddit.com/api/submit' + '?kind=link&url=' + invite_link + '&sr=discordservers&title=' + encodeURIComponent(title),
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

      var good_req = JSON.stringify(JSON.parse(result_submit).success) + '`\n' + JSON.parse(result_submit).jquery[16][3][0];
      var bad_req = JSON.stringify(JSON.parse(result_submit).success) + '`\n`Reason: ' + JSON.parse(result_submit).jquery[22][3][0] + '`';

      msg.channel.stopTyping();
      msg.channel.send(JSON.stringify(JSON.parse(result_submit).success) == "true" ? '`Result of a request - Success: ' + good_req : '`Result of a request - Success: ' + bad_req);

    }
  }

}
