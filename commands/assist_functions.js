const path = require('path');
const Discord = require('discord.js');

const usedCommand = new Set();

module.exports = {
  /**
  * @name populateChannelJSON(...)
  *
  * @param {JSON} json_channels 
  * @param {Guild} guild 
  * @param {POOL} pool 
  *
  * @description : Assistant function, maintains consistency of server channels amount with DB.
  */
  populateChannelJSON: function(json_channels, guild, pool){
    let object = new Object();
    let check = false;
    let count_channels = 0;
    let channels_str = "|";

    for(let i = 1; i < guild.channels.size; i++){
      if(guild.channels.array()[i].type == "text"){
        channels_str += guild.channels.array()[i].id + "|";
        count_channels++;
      }
    }

    if(Object.keys(json_channels).length >= count_channels){
      for(let key in json_channels){
        if(!channels_str.includes(key)) delete json_channels[key]
      }

      check = true;
    }

    for(let i = 0; i < guild.channels.size; i++){
      if(!JSON.stringify(json_channels).includes(guild.channels.array()[i].id) && guild.channels.array()[i].type == "text"){
        object["no_message"] = 0;
        json_channels[guild.channels.array()[i].id] = object;
        
        check = true;
      }
    }

    if(check == true){
      pool.query('UPDATE words SET count_stats = $1 FROM guilds WHERE(guilds.gid = $2 AND guilds.uugid = words.uugid)',[JSON.stringify(json_channels), guild.id])
        .catch((err)=>{
          return console.error('on DB query populateChannelJSON;', err.stack); 
        });
    }

  },

  /**
   * @name userTimeOut(...)
   * 
   * @param {Message} msg 
   * 
   * @description : Timer to avoid spamming.
   */
  userTimeOut: function(msg, timer = 6000){
    if(msg.author.bot == true) return true;

    if(usedCommand.has(msg.author.id)){
      //msg.channel.send("`Wait for 2 seconds before using commands again.`");
      msg.react('⏳');
      return true;
    }
    else{
      usedCommand.add(msg.author.id);
      setTimeout(() => {
        usedCommand.delete(msg.author.id);
      }, timer);
      return false;
    }
  },

    /**
   * @name serverTimeOut(...)
   * 
   * @param {Message} msg 
   * 
   * @description : Timer to avoid spamming.
   */
  serverTimeOut: function(msg, timer = 40000){
    if(msg.author.bot == true) return true;

    if(usedCommand.has(msg.guild.id)){
      //msg.channel.send("`Wait for 2 seconds before using commands again.`");
      msg.react('⏱');
      return true;
    }
    else{
      usedCommand.add(msg.guild.id);
      setTimeout(() => {
        usedCommand.delete(msg.guild.id);
      }, timer);
      return false;
    }
  },

  /**
   * @name createIntList(...)
   * 
   * @param {MESSAGE} msg 
   * @param {Array} pages 
   * 
   * @description : stands for Create Interactive List. Creates event listeners and events themselves. Allows 
   *                creation of interactive lists through which a user can iterate using emojis 
   */
  createIntList: function(msg, pages){
    //external scope let
    let page = 1;

    msg.channel.stopTyping();
    msg.channel.send(pages[0]).then(msg_pages =>{
      msg_pages.react('⏪').then( r => {
        msg_pages.react('⏩');

        //create 2 filters
        const backwardsFilter = (reaction, usr) => reaction.emoji.name === '⏪' && usr.id === msg.author.id;
        const forwardsFilter = (reaction, usr) => reaction.emoji.name === '⏩' && usr.id === msg.author.id;

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
  },

  /**
   * @name content_type(...)
   * 
   * @param {String} str 
   * 
   * @description : checks if any media is present in supplied link
   */
  content_type: function(url){
    let result = path.extname(url);

    if(result.toLowerCase().includes("png")){
      return "media";
    }
    else if(result.toLowerCase().includes("jpg") || result.toLowerCase().includes("jpeg")){
      return "media";
    }
    else if(result.toLowerCase().includes("image")){
      return "media";      
    }
    else if(result.toLowerCase().includes("gif")){
      return "media";
    }
    else{
      return "link";      
    }
  },

  /**
   * @name random_hex_colour()
   * 
   * @param {void}
   * 
   * @description : generate random hex colour
   */
  random_hex_colour: function(){
    return '#'+Math.floor(Math.random()*16777215).toString(16);
  },

  /**
   * @name id_to_name(...)
   * 
   * @description : replaces ids with user names in string
   * 
   * @param {String} str 
   * @param {CLIENT} client 
   * @param {MESSAGE} msg 
   */
  id_to_name: async function(str, client, msg){
    if(/<@.?[0-9]+>/.test(str)){
      let user_id = str.slice(str.indexOf("@")+1, str.indexOf(">")).replace(/\D/g,'');
      let user;

      try{
        user = await client.fetchUser(user_id);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      user = user.username;

      return str.replace(/<@.?[0-9]+>/, user);
    }else{
      return str;
    }
  },

  random_number: function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  id_to_user: async function(str, client, msg){
    if(/<@.?[0-9]+>/.test(str)){
      let user_id = str.slice(str.indexOf("@")+1, str.indexOf(">")).replace(/\D/g,'');
      let user;

      try{
        user = await client.fetchUser(user_id);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      return user;
    }
    
  }

}