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
    var object = new Object();
    var check = false;
    var count_channels = 0;
    var channels_str = "|";

    for(var i = 1; i < guild.channels.size; i++){
      if(guild.channels.array()[i].type == "text"){
        channels_str += guild.channels.array()[i].id + "|";
        count_channels++;
      }
    }

    if(Object.keys(json_channels).length >= count_channels){
      for(var key in json_channels){
        if(!channels_str.includes(key)) delete json_channels[key]
      }

      check = true;
    }

    for(var i = 0; i < guild.channels.size; i++){
      if(!JSON.stringify(json_channels).includes(guild.channels.array()[i].id) && guild.channels.array()[i].type == "text"){
        object["no_message"] = 0;
        json_channels[guild.channels.array()[i].id] = object;
        
        check = true;
      }
    }

    if(check == true){
      pool.query('UPDATE words SET count_stats = $1 FROM guilds WHERE(guilds.gid = $2 AND guilds.uugid = words.uugid)',[JSON.stringify(json_channels), guild.id])
        .catch((err)=>{
          console.log("it was a failure");
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
  userTimeOut: function(msg){
    if(usedCommand.has(msg.author.id)){
      msg.channel.send("`Wait for 3 seconds before using commands again.`");
      return true;
    }
    else{
      usedCommand.add(msg.author.id);
      setTimeout(() => {
        usedCommand.delete(msg.author.id);
      }, 6000);
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
    //external scope var
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
  }

}