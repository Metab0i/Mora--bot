const Discord = require('discord.js');
const assist_func = require('./assist_functions');

module.exports = {
  /**
   * @name ranks_set_up(...)
   * 
   * @description : set up ranks feature. How much XP is needed for a role
   * 
   * @param {String} prefix 
   * @param {MESSAGE} msg 
   * @param {PSQL-POOL} pool 
   */
  ranks_set_up: async function(prefix, msg, pool, client){
    const ranks_exp = new RegExp("^" + prefix + "ranksetup");

    //check that the one who runs the command is admin of the server. 
    if(ranks_exp.test(msg.content.toLowerCase().trim()) && msg.member.hasPermission("ADMINISTATOR") == true){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;

      //set up a message collector to track responses from user
      const msg_collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
        time: 60000,
        max: 1000,
        maxMatches: 3000
      })

      const embed = new Discord.RichEmbed()
        .setTitle("Ranks set-up page:")
        .setDescription("Send a role name you want to track or type cancel.")
        .setColor(assist_func.random_hex_colour());

      await msg.channel.send(embed);
      //use collector as a way for waiting on input from the user (integrate it within the roleCollector_loop())
      msg_collector.once('collect', message => {   
        //define a recursive function to track inputs from a user
        const roleCollector_loop = async function() {
          embed.setDescription("Would you like to set another role? Type cancel if you wish to exit.");
          
          const new_prompt = await message.channel.send(embed);

          if(message.content.toLowerCase() == "cancel"){
            msg_collector.stop();
            const msg_confirmation = await msg.channel.send("`Operation cancelled`");
            msg_confirmation.delete(1000);
            new_prompt.delete();
          }

          let check_role = false;

          //if exists, proceed to query for how much xp is required to achieve said role and loop again to see if they want to set up another role
          message.guild.roles.forEach(role => {
            if(role.name.toLowerCase() == message.content.toLowerCase()){
              new_prompt.delete(300);
              
              check_role = true;
              roleCollector_loop();
            }
          });

          if(check_role == false){
            msg_collector.stop();

            embed.setDescription("Wrong Role Entered. Try Again");

            new_prompt.edit(embed);
            new_prompt.delete(1000);
          }
        }
        
        roleCollector_loop();
      })
    }

  },

  ranks_exp_msg: function(msg, pool){

  },

  ranks_grant_xp: function(prefix, msg, pool){

  },

  ranks_remove_xp: function(prefix, msg, pool){

  },

  ranks_onoff_user: function(prefix, msg, pool){

  }
}