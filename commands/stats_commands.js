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

      //record emojis
      let emoji_list = "";

      msg.guild.emojis.cache.array().forEach(emoji =>{
        if(emoji_list.length < 2000){
          emoji_list += `${emoji} `;
        }
      })

      //verification level of the server
      let ver_level = "s";

      switch(msg.guild.verificationLevel){
        case "NONE":
          ver_level = "None";
          break;
        case "LOW": 
          ver_level = "Low";
          break;
        case "MEDIUM": 
          ver_level = "Medium"
          break;
        case "HIGH": 
          ver_level = "High (╯°□°）╯︵ ┻━┻"
          break;
        case "VERY_HIGH":
          ver_level = "Extreme ┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻"
          break;
      }

      //count total online members
      let total_online = 0;

      msg.guild.presences.cache.array().forEach(presnece =>{
        switch(presnece.status){
          case "online":
            total_online += 1;
            break;
          case "dnd":
            total_online += 1;
            break;
          case "idle":
            total_online += 1;
            break;
        }
      })

      const embed = new Discord.MessageEmbed()
        .setColor(assist_func.random_hex_colour())
        .setTitle(msg.guild.name)
        .setThumbnail(msg.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) == null ? "" : msg.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }))
        .setDescription(emoji_list)
        .addField("ID: " , msg.guild.id)
        .addField("Verification Level: ", ver_level)
        .addField("Region:" , msg.guild.region, true)
        .addField("Owner of the guild", msg.guild.owner, true)
        .addField("Number of roles:", msg.guild.roles.cache.size, true)
        .addField("Total members:" , msg.guild.memberCount, true)
        .addField("Members Online ATM:", total_online, true)
        .addField("Number of Channels:", msg.guild.channels.cache.size, true)
        .setFooter("Server creation date: " + msg.guild.createdAt);

      msg.channel.send(embed);
    }
  },

  /**
   * @name bot_stats(...)
   * 
   * @description : sends an embed of overall general statistics of the application
   * 
   * @param {String} prefix 
   * @param {String} msg 
   * @param {CLIENT} client 
   * @param {Int} errors 
   */
  bot_stats: function(prefix, msg, client, errors){
    if(prefix + "botstats" == msg.content.toLowerCase()){

      if(assist_func.userTimeOut(msg) == true) return;

      let total_members = 0;
      let mobile = 0;
      let desktop = 0;
      let web = 0;

      client.guilds.array().forEach(guild =>{
        total_members += guild.memberCount

        guild.members.forEach(member => {
          //console.log(member.presence.clientStatus);
          for(var device in member.presence.clientStatus){
            switch(device.toString()){
              case "mobile":
                mobile += 1;
                break;
              case "desktop":
                desktop += 1;
                break;
              case "web":
                web += 1;
                break;
            }
          }
        })
      })

      //define necessities for uptime trackage:
      String.prototype.toDDHHMMSS = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var days    = Math.floor(sec_num / 86400)
        var hours   = Math.floor((sec_num - (days * 86400)) / 3600); //Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
        var seconds = sec_num - (days * 86400) - (hours * 3600) - (minutes * 60);
        
        if (days    < 10) {days    = "0"+days;}
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = days + 'd : ' + hours + 'h : ' + minutes + 'm : ' + seconds + "s";
        return time;
      }

      const time = process.uptime();
      const uptime = (time + "").toDDHHMMSS();

      const embed = new Discord.MessageEmbed()
        .setColor('#d65aa6')
        .setTitle(client.user.username)
        .setThumbnail(client.user.avatarURL({format: "png"}))
        .addField("Total Server Count:", client.guilds.size, true)
        .addField("Total members across servers:", total_members, true)
        .addField("Online mobile users:", mobile, true)
        .addField("Online desktop users:", desktop, true)
        .addField("Online web users:", web, true)
        .addField("Total Uptime:" , uptime, true)
        .addField("Exceptions thrown during Runtime:", errors, true)
        .addField("Total commands called during runtime:", assist_func.get_commands(), true)
        .setFooter("🐍")

      msg.channel.send(embed);
    }
  }
}