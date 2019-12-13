const Discord = require('discord.js');
const assist_func = require('./assist_functions');

module.exports = {

  /**
   * @name server_stats(...)
   * 
   * @description : Displays current server's statistics
   * 
   * @param {String} prefix 
   * @param {String} msg 
   */
  server_stats: function(prefix, msg){
    if(prefix + "srvstats" == msg.content.toLowerCase()){

      if(assist_func.userTimeOut(msg) == true) return;

      let emoji_list = "";

      msg.guild.emojis.array().forEach(emoji =>{
        if(emoji_list.length > 1900){
          //msg.channel.send(emoji_list)
          emoji_list = emoji_list
        }
        else{
          emoji_list += `${emoji} `;
        }
      })

      const embed = new Discord.RichEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.guild.name)
        .setThumbnail(msg.guild.iconURL)
        .setDescription(emoji_list)
        .addField("Initial given role:", msg.guild.defaultRole)
        .addField("Region:" , msg.guild.region)
        .addField("Owner of the guild", msg.guild.owner)
        .addField("Number of roles:", msg.guild.roles.size)
        .addField("Total members:" , msg.guild.memberCount)
        .addField("Number of Channels:", msg.guild.channels.size)
        .setFooter("Server created at: " + msg.guild.createdAt)

      msg.channel.send(embed);
    }
  }
}