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
   * @description : posts a random post from a specified sub-reddit.
   */
  serve_reddit: async function(prefix, msg){
    let pasta = new RegExp("^" + prefix + "r .*? ");

    if(pasta.test(msg.content.toLowerCase())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;    
      msg.channel.startTyping();

      let embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour());

      let reddit = "https://www.reddit.com";
      let subr = msg.content.slice(msg.content.indexOf(" ")+1);
      subr = subr.slice(0, subr.indexOf(" "));
      let category = msg.content.slice(msg.content.indexOf(subr) + subr.length+1, msg.content.length).replace(/\s/g, "");

      let request = "";
      let result;

      switch(category.toLowerCase()) {
        case "top":
          request = reddit + `/r/${subr}/top/.json?limit=85&t=day`;
          break;
        case "tophour":
          request = reddit + `/r/${subr}/top/.json?limit=85&t=hour`;
          break;
        case "topweek":
          request = reddit + `/r/${subr}/top/.json?limit=85&t=week`;
          break;
        case "topmonth":
          request = reddit + `/r/${subr}/top/.json?limit=85&t=month`;
          break;
        case "topall":
          request = reddit + `/r/${subr}/top/.json?limit=85&t=year`;
          break;
        case "new":
          request = reddit + `/r/${subr}/new/.json?limit=85`;
          break;
        case "hot":
          request = reddit + `/r/${subr}/hot/.json?limit=85`;
          break;
        case "controversial":
          request = reddit + `/r/${subr}/controversial/.json?limit=85`;
          break;
        case "rising":
          request = reddit + `/r/${subr}/rising/.json?limit=85`;
          break;
        default:
          msg.channel.stopTyping();
          return msg.channel.send("`Wrong category, try again.`");
      }

      let options = {
        uri: request,
        json: true // Automatically parses the JSON string 
      };

      try{
        result = await rp(options);        
      }catch(err){
        msg.channel.stopTyping();
        msg.channel.send("`" + err.message + "`");
        return console.error('on [' + msg.content + ']\nBy <@' + msg. author.id + ">", err.stack);        
      }

      let reddit_dataset = result.data['children'][Math.floor((Math.random() * result.data['children'].length) + 0)];

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

  /**
   * @name update_ad(...)
   * 
   * @description : Posts an ad on reddit.
   * 
   * @param {String} prefix 
   * @param {String} msg 
   * @param {USER} user 
   */
  update_ad: async function(prefix, msg, user){
    let up_ad = new RegExp("^" + prefix + "gdbump <#.?[0-9]+> .*?$");

    if(up_ad.test(msg.content.toLowerCase())){
      msg.channel.startTyping();
      let result;
      let invite_link;
      let invites;
      let result_submit_ds;
      let result_submit_da;

      let reddit = "https://www.reddit.com/api/v1/access_token";

      let channel_id = msg.content.slice(msg.content.indexOf("#")+1, msg.content.indexOf(">"));

      let title = msg.content.slice(msg.content.indexOf(">") + 2, msg.content.length);

      let options = {
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

      //Primary reason for using try catch is predominantly due to me trying to document errors in a log file
      try{
        invites = await msg.guild.fetchInvites();

        for(let i = 0; i < invites.array().length; i++){
          try{
            if(invites.array()[i].inviter.id == user) invites.array()[i].delete();
          }catch(err){
            invites.array()[i].delete();
          }
          
        }

        result = await rp(options);
        invite_link = (await msg.guild.channels.cache.get(channel_id).createInvite({
          maxAge: 0,
          maxUses: 0
        })).url;

        console.log(invite_link);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack); 
      }

      let options_submit_ds = {
        url: 'https://oauth.reddit.com/api/submit' + '?kind=link&url=' + invite_link + '&sr=discordservers&title=' + encodeURIComponent(title),
        method: 'POST',
        headers: {
            'Authorization': 'bearer '+ result.access_token,
            'user-agent': reddit_auth.user_agent
        }
      }

      let options_submit_da = {
        url: 'https://oauth.reddit.com/api/submit' + '?kind=link&url=' + invite_link + '&sr=DiscordAdvertising&title=' + encodeURIComponent(title),
        method: 'POST',
        headers: {
            'Authorization': 'bearer '+ result.access_token,
            'user-agent': reddit_auth.user_agent
        }
      }

      try{
        result_submit_ds = await rp(options_submit_ds);
        result_submit_da = await rp(options_submit_da);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      let good_req_ds = JSON.stringify(JSON.parse(result_submit_ds).success) + '`\n' + JSON.parse(result_submit_ds).jquery[16][3][0];
      let bad_req_ds = JSON.stringify(JSON.parse(result_submit_ds).success) + '`\n`Reason: ' + JSON.parse(result_submit_ds).jquery[14][3][0] + '`';
      
      let good_req_da = JSON.stringify(JSON.parse(result_submit_da).success) + '`\n' + JSON.parse(result_submit_da).jquery[16][3][0];
      let bad_req_da = JSON.stringify(JSON.parse(result_submit_da).success) + '`\n`Reason: ' + JSON.parse(result_submit_da).jquery[14][3][0] + '`';

      msg.channel.stopTyping();
      
      msg.channel.send(JSON.stringify(JSON.parse(result_submit_ds).success) == "true" ? '`Result of a request - Success: ' + good_req_ds : '`Result of a request - Success: ' + bad_req_ds);
      msg.channel.send(JSON.stringify(JSON.parse(result_submit_da).success) == "true" ? '`Result of a request - Success: ' + good_req_da : '`Result of a request - Success: ' + bad_req_da);

    }
  }

}