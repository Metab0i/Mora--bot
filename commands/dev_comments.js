const Discord = require('discord.js');
const assist_func = require('./assist_functions');
let channel;

module.exports = {
  /**
   * @name set_channel(...)
   * 
   * @description : set a channel for dev comments
   * 
   * @param {String} prefix 
   * @param {String} msg 
   */
  set_channel: function(prefix, msg){
    if(msg.author.id == '360790875560869889' && msg.content == prefix + "set_commChannel"){
      channel == null ? channel = msg.channel : msg.channel.send("`Channel already set.`").then(message =>{
        message.delete({timeout: 5000});
        return;
      })
      
      msg.react("👨‍💻");
      msg.delete({timeout: 5000});
    }
  },

  /**
   * @name leave_comment(...)
   * 
   * @description : allows users to leave any kind of comment. A secret, a thought, pretty much anything that they wish to say. (All anonymous)\
   * 
   * @param {String} prefix 
   * @param {String} msg 
   */
  leave_comment: async function(prefix, msg){
    let comment = new RegExp("^" + prefix + "comment .*?");

    if(comment.test(msg.content.toLowerCase())){
      const dev_comment = msg.content.slice(msg.content.indexOf(" "), msg.content.length);

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;
      if(channel == null) {
        msg.delete({timeout: 5000});
        return msg.react("🦷")
      }

      const invites = await channel.guild.fetchInvites();
      
      const embed = new Discord.MessageEmbed()
        .setAuthor(msg.guild.name, msg.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) == null ? channel.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) :msg.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }))
        .setDescription(dev_comment.length > 1900 ? "`" + dev_comment.slice(0, 1800) + "... `" : "`" + dev_comment + "`")
        .setFooter("🐍")
        .setColor('#d65aa6');

        //If dev wants a bot to send an invite to their server whenever a comment is sent
      // msg.channel.send(invites.array()[0].url).then(message => {
      //   message.delete(5000);
      //   msg.react("👁");
      //   msg.delete({timeout: 5000});

      //   channel.send(embed);
      // })
      
      await msg.react("👁");
      await msg.react("👂");
      msg.delete({timeout: 5000});

      channel.send(embed);

    }
  }
}