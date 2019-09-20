const Discord = require('discord.js');
const path = require('path');
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
  serve_reddit: async function(prefix, msg){
    var pasta = new RegExp("^" + prefix + "r .*? ");

    if(pasta.test(msg.content.toLowerCase())){
      //User timer
      //if(assist_func.userTimeOut(msg) == true) return;    
      msg.channel.startTyping();

      var embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour());

      var reddit = "https://www.reddit.com";
      var subr = msg.content.slice(msg.content.indexOf(" ")+1);
      subr = subr.slice(0, subr.indexOf(" "));
      var category = msg.content.slice(msg.content.indexOf(subr) + subr.length+1, msg.content.length).replace(/\s/g, "");

      var request = "";

      switch(category.toLowerCase()) {
        case "top":
          request = reddit + `/r/${subr}/top/.json?limit=24`;
          break;
        case "new":
          request = reddit + `/r/${subr}/new/.json?limit=24`;
          break;
        case "hot":
          request = reddit + `/r/${subr}/hot/.json?limit=24`;
          break;
        case "controversial":
          request = reddit + `/r/${subr}/controversial/.json?limit=24`;
          break;
        case "rising":
          request = reddit + `/r/${subr}/rising/.json?limit=24`;
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
        msg.channel.stopTyping();
        msg.channel.send("`" + err.message + "`");
        return console.error('on [' + msg.content + ']\nBy <@' + msg. author.id + ">", err.stack);        
      }

      var reddit_dataset = result.data['children'][Math.floor((Math.random() * result.data['children'].length) + 0)];

      msg.channel.stopTyping();
      if(reddit_dataset == null) return msg.channel.send("`Bad request, try again.`");

      embed.setFooter(reddit_dataset.data['ups'] + " votes and " + reddit_dataset.data['num_comments'] + " comments");

      if(assist_func.content_type(reddit_dataset.data['url']) == "link"){
        embed.setTitle(reddit_dataset.data['title'].length <= 256 ? reddit_dataset.data['title'] : reddit_dataset.data['title'].slice(0, 252) + "...")
            .setURL(reddit + reddit_dataset.data['permalink'])
            .setAuthor("r/" + subr)
            .setDescription(reddit_dataset.data['selftext'].length <= 2047 ? (reddit_dataset.data['selftext'] == "" ? "" : reddit_dataset.data['selftext']) : reddit_dataset.data['selftext'].slice(0, 2044) + "...");
        
        if(reddit_dataset.data['selftext'] == "") {
          msg.channel.send(reddit_dataset.data['url']); 
        }

        msg.channel.send(embed);
      }
      else{
        embed.setTitle(reddit_dataset.data['title'].length <= 256 ? reddit_dataset.data['title'] : reddit_dataset.data['title'].slice(0, 252) + "...")
             .setURL(reddit + reddit_dataset.data['permalink'])
             .setAuthor("r/" + subr)
             .setImage(reddit_dataset.data['url'])
        
        msg.channel.send(embed);

      }
    }
  },

  update_ad: async function(prefix, msg, user){
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
          if(invites.array()[i].inviter.id == user) invites.array()[i].delete();
        }

        var result = await rp(options);
        var invite_link = await msg.guild.channels.get(channel_id).createInvite({
          maxAge: 0,
          maxUses: 0
        });
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack); 
      }

      var options_submit_ds = {
        url: 'https://oauth.reddit.com/api/submit' + '?kind=link&url=' + invite_link + '&sr=discordservers&title=' + encodeURIComponent(title),
        method: 'POST',
        headers: {
            'Authorization': 'bearer '+ result.access_token,
            'user-agent': reddit_auth.user_agent
        }
      }

      var options_submit_da = {
        url: 'https://oauth.reddit.com/api/submit' + '?kind=link&url=' + invite_link + '&sr=DiscordAdvertising&title=' + encodeURIComponent(title),
        method: 'POST',
        headers: {
            'Authorization': 'bearer '+ result.access_token,
            'user-agent': reddit_auth.user_agent
        }
      }

      try{
        var result_submit_ds = await rp(options_submit_ds);
        var result_submit_da = await rp(options_submit_da);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      var good_req_ds = JSON.stringify(JSON.parse(result_submit_ds).success) + '`\n' + JSON.parse(result_submit_ds).jquery[16][3][0];
      var bad_req_ds = JSON.stringify(JSON.parse(result_submit_ds).success) + '`\n`Reason: ' + JSON.parse(result_submit_ds).jquery[22][3][0] + '`';
      var good_req_da = JSON.stringify(JSON.parse(result_submit_da).success) + '`\n' + JSON.parse(result_submit_da).jquery[16][3][0];
      var bad_req_da = JSON.stringify(JSON.parse(result_submit_da).success) + '`\n`Reason: ' + JSON.parse(result_submit_da).jquery[22][3][0] + '`';

      msg.channel.stopTyping();
      
      msg.channel.send(JSON.stringify(JSON.parse(result_submit_ds).success) == "true" ? '`Result of a request - Success: ' + good_req_ds : '`Result of a request - Success: ' + bad_req_ds);
      msg.channel.send(JSON.stringify(JSON.parse(result_submit_da).success) == "true" ? '`Result of a request - Success: ' + good_req_da : '`Result of a request - Success: ' + bad_req_da);

    }
  }

}
