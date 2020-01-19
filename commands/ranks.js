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

    if(ranks_exp.test(msg.content.toLowerCase())){

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
        .setColor(assist_func.random_hex_colour())
      
      const set_up_msg = await msg.channel.send(embed)

      msg_collector.on('collect', message => {

        //define a recursive function to track inputs from a user
        const roleCollector_loop = async function() {
          if(message.content.toLowerCase() != "cancel" && msg_collector.ended != true){
            set_up_msg.delete(300);
            
            //check if role exists
            
            roleCollector_loop();
          }

          else if(message.content.toLowerCase() == "cancel"){
            msg_collector.stop();

            const msg_confirmation = await msg.channel.send("`Operation cancelled`");
            msg_confirmation.delete(400);
          }

          else if(msg_collector.ended == true){
            const msg_confirmation = await msg.channel.send("`Time has ran out.`");
            msg_confirmation.delete(400);
          }
        }

        //initiate a loop
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