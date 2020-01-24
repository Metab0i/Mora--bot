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

      //Essential Variable definition
      let role_name = "";
      let role_xp = "";

      const embed = new Discord.RichEmbed()
        .setTitle("Ranks set-up page:")
        .setDescription("Specify a role name you want to track or type cancel.")
        .setColor(assist_func.random_hex_colour())
        .setFooter("Operation will last for 2 minutes.");

      await msg.channel.send(embed);
     
      //loop to initiate a role collection
      const roleCollector_loop = function(){
        if(embed.description.toLowerCase() == "wrong input. try again"){
          embed.setDescription("Specify a role name you want to track or type cancel.")

          msg.channel.send(embed);
        }

        msg_collector.once('collect', async r_message => {
          if(r_message.content.toLowerCase() == "cancel" || r_message.content.toLowerCase().includes("%ranksetup")){
            msg_collector.stop();
            return (await msg.channel.send("`Operation Cancelled`")).delete(1000);
          }

          let match_check = false;

          //if exists, proceed to query for how much xp is required to achieve said role and loop again to see if they want to set up another role
          r_message.guild.roles.forEach(role => {
            if(role.name.toLowerCase() == r_message.content.toLowerCase()){
              embed.setDescription("Would you like to set another role? Type cancel if you wish to exit.");
              match_check = true;

              role_name = r_message.content.toLowerCase();

              expRoleCollector_loop();
            }
          });

          if(match_check == false){
            const warning_msg = await msg.channel.send(embed.setDescription("Wrong Input. Try again"));
            await warning_msg.delete(1000);

            return roleCollector_loop();
          }
        });
      }

      //loop to record how much xp is required for a role to be obtained.
      const expRoleCollector_loop = function(){
        embed.setDescription("How much XP is required to obtain a mentioned role? Type cancel if you wish to exit.")
        msg.channel.send(embed);

        //define a regex to check if entered string is just numbers
        const just_numb = new RegExp("^[0-9]+$");

        msg_collector.once('collect', async xp_message => {
          if(xp_message.content.toLowerCase() == "cancel" || xp_message.content.toLowerCase() == "cancel" || xp_message.content.toLowerCase().includes("%ranksetup")){
            msg_collector.stop();
            return (await msg.channel.send("`Operation Cancelled`")).delete(1000);
          }

          if(just_numb.test(xp_message.content)){
            role_xp = xp_message.content;

            embed.setDescription("Would you like to confirm? [Y/N]")
                 .addField("`Role Name:`", role_name, true)
                 .addField("`Required XP`", role_xp, true);
            
            msg.channel.send(embed);

            embed.fields.splice(0, embed.fields.length)

            msg_collector.once('collect', async confirm_msg =>{
              if(confirm_msg.content.toLowerCase() == "y"){
                //push to db
              }
              else if(confirm_msg.content.toLowerCase() == "n"){
                (await msg.channel.send(embed.setDescription("`Operation Cancelled`"))).delete(1000);

                return msg_collector.stop();
              }
              else{
                (await msg.channel.send(embed.setDescription("`Unknown entry. Operation Cancelled`"))).delete(1000);
                
                return msg_collector.stop();
              }
            })
          }

          else{
            const warning_msg = await msg.channel.send(embed.setDescription("Your Message contains letters, has to be just numbers. Try Again."));
            await warning_msg.delete(3000);

            return expRoleCollector_loop();
          }
        })
      }

      roleCollector_loop();

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