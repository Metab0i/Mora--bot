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
  }

}