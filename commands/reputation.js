const Discord = require('discord.js');
const assist_func = require('./assist_functions');


//TODO:
/**
 * 1. When a role is being displayed in rep.board be sure to verify that it still exists (implement an assistance function for that.)
 * 2. Every time a user gets granted xp, check if the roles in db are consistent with guild
 * 3. %rep.help - sends an outline of how to use the feature 
 * 4. %rep - sends a list of possible commands to DMs.
 */

module.exports = {

  //- - - - - - - - - - - - - - - - - - - - - - - - - Assist functions - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * @name ranks_setUp_assist(...)
   * 
   * @description : processes a json arg, and updates db appropriately
   * 
   * @param {json} ranks_json 
   */
  rep_setUp_assist: async function(msg, role_data, rep_json, pool){
    if(JSON.stringify(rep_json.roles).trim() === "{\"\":\"\"}"){
      const role_name = role_data.split(";")[0];
      const role_xp = role_data.split(";")[1];
      let role_id = "";

      //grab role's ID
      msg.guild.roles.forEach(role => {
        if(role.name.toLowerCase() === role_name){
          role_id = role.id;
        }
      })

      //template verified, proceed to remove it and substitute it with real data
      delete rep_json.roles[""]
      rep_json.roles[role_id] = role_xp

      const fin_json = rep_json;

      //update the DB
      try{
        await pool.query('UPDATE guilds SET ranks_feature = $1 WHERE (gid = $2)', [fin_json, msg.guild.id]);
      }catch(err){
        (await msg.channel.send("`Something went wrong, operation failed.`")).delete(5000);
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);
      }
      
      (await msg.channel.send("`Operation was a success, added: *" + role_name + " : " + role_xp + "*`")).delete(7000);
    }
    else{
      //if the same element is mentioned, just overwrite the already existing item with new xp value
      const role_name = role_data.split(";")[0];
      const role_xp = role_data.split(";")[1];
      let role_id = "";

      //grab role's ID
      msg.guild.roles.forEach(role => {
        if(role.name.toLowerCase() === role_name){
          role_id = role.id;
        }
      })

      rep_json.roles[role_id] = role_xp

      const fin_json = rep_json;

      //update the DB
      try{
        await pool.query('UPDATE guilds SET ranks_feature = $1 WHERE (gid = $2)', [fin_json, msg.guild.id]);
      }catch(err){
        (await msg.channel.send("`Something went wrong, operation failed.`")).delete(5000);
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);
      }
      
      (await msg.channel.send("`Operation was a success, added: *" + role_name + " : " + role_xp + "*`")).delete(7000);
    }
  },

  /**
   * @name role_exists(...);
   * 
   * @description : checks if role exists or not, if it does, return true, if it does, don't do anything. If it doesn't proceed to remove it from the DB
   * 
   * @param {String} role_id 
   * @param {PSQL} pool 
   * @param {GUILD} guild 
   */
  role_exists: async function(role_id, pool, guild){
    const q_result = await guild.roles.find(val => val.id == role_id);

    if(q_result == null){
      //pull latest db data to be written to
      let ranks_rep;
      try{
        ranks_rep = (await pool.query('SELECT ranks_feature FROM guilds WHERE (gid = $1)', [guild.id])).rows[0].ranks_feature;
      }catch(err){
        return console.error('on [ role_exist function ]\n', err.stack);
      }

      delete ranks_rep.roles[role_id]

      //update db with latest data
      try{
        await pool.query('UPDATE guilds SET ranks_feature = $1 WHERE (gid = $2)', [ranks_rep, guild.id]);
      }catch(err){
        return console.error('on [ role_exist function ]\n', err.stack);
      }

      return false;
      
    }

    return true;

  },

  /**
   * @name user_exists(...);
   * 
   * @description : verifies whether user exists within the guild and DB, if user exists in DB but not in guild, proceed to remove the item from db.
   * 
   * @param {Int} user_id 
   * @param {PSQL} pool 
   * @param {GUILD} guild 
   */
  user_exists: async function(user_id, pool, guild){
    const check_guild = await guild.members.find(val => val.id == user_id);
    
    //pull latest db data to be written to
    let users_g;
    try{
      users_g = (await pool.query('SELECT users FROM guilds WHERE (gid = $1)', [guild.id])).rows[0].users;
    }catch(err){
      return console.error('on [ user_exists function ]\n', err.stack);
    }

    if(users_g.users[user_id] != undefined && check_guild == null){
      delete users_g.users[user_id]

      //update db with latest data
      try{
        await pool.query('UPDATE guilds SET users = $1 WHERE (gid = $2)', [users_g, guild.id]);
      }catch(err){
        return console.error('on [ role_exist function ]\n', err.stack);
      }

      return false;

    }

    else if(check_guild == null){
      return false;
    }

    return true;

  },

  /**
   * @name user_add_xp(...)
   * 
   * @description : adds xp to the associated user within the external PSQL db. 
   * 
   * @param {Int} user_id 
   * @param {PSQL} pool 
   * @param {GUILD} guild 
   * @param {Int} amount 
   */
  user_add_xp: async function(user_id, pool, guild, amount){
    //pull latest db data to be written to
    let users_g;
    try{
      users_g = (await pool.query('SELECT users FROM guilds WHERE (gid = $1)', [guild.id])).rows[0].users;
    }catch(err){
      return console.error('on [ user_exists function ]\n', err.stack);
    }

    if(Number(users_g.users[user_id]) > 999999999){
      guild.owner.send("`-" + user_id + "-'s rep xp exceeds 999,999,999. They cannot earn any more xp.`")
      return false;
    }

    if(users_g.users[user_id] == undefined){
      users_g.users[user_id] = amount;
    }

    else{
      users_g.users[user_id] = Number(users_g.users[user_id]) + Number(amount);
    }

    //update db with latest data
    try{
      await pool.query('UPDATE guilds SET users = $1 WHERE (gid = $2)', [users_g, guild.id]);
    }catch(err){
      return console.error('on [ role_exist function ]\n', err.stack);
    }

    return true;
  },

//- - - - - - - - - - - - - - - - - - - - - - - - - Main functions - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * @name rep_set_up(...)
   * 
   * @description : set up ranks feature. How much XP is needed for a role. Utilizes the MessageCollector, Nodejs Event and node-psql to function.
   *                MessageCollector - to keep track of user's messages, Events - integration as a part of MessageCollector, node-psql - for db interaction. 
   * 
   * @param {String} prefix 
   * @param {MESSAGE} msg 
   * @param {PSQL-POOL} pool 
   */
  rep_set_up: async function(prefix, msg, pool, client){
    const rep_xp = new RegExp("^" + prefix + "rep\.setup");

    //check that the one who runs the command is admin of the server. 
    if(rep_xp.test(msg.content.toLowerCase().trim()) && msg.member.hasPermission("ADMINISTATOR") == true){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;

      msg.channel.startTyping();

      //pull latest db data to be written to
      let db_pull_result;
      try{
        db_pull_result = await pool.query('SELECT ranks_feature FROM guilds WHERE (gid = $1)', [msg.guild.id]);
        msg.channel.stopTyping();
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);
      }

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
        .setTitle("Rep set-up page:")
        .setDescription("Specify a role name you want to track or type cancel.")
        .setColor(assist_func.random_hex_colour())
        .setFooter("Operation will last for 2 minutes.");

      let first_msg = await msg.channel.send(embed);
     
      //loop to initiate a role collection
      const roleCollector_loop = async function(){
        if(embed.description.toLowerCase() == "wrong input. try again"){
          embed.setDescription("Specify a role name you want to track or type cancel.")

          first_msg = await msg.channel.send(embed);
        }

        msg_collector.once('collect', async r_message => {
          if(r_message.content.toLowerCase() == "cancel" || r_message.content.toLowerCase().includes("%r.setup")){
            msg_collector.stop();

            await first_msg.delete();
            await r_message.delete();

            return (await msg.channel.send("`Operation Cancelled`")).delete(1000);
          }

          let match_check = false;

          //if exists, proceed to query for how much xp is required to achieve said role and loop again to see if they want to set up another role
          r_message.guild.roles.forEach(role => {
            if(role.name.toLowerCase() == r_message.content.toLowerCase()){
              match_check = true;

              role_name = r_message.content.toLowerCase();

              expRoleCollector_loop();
            }
          });

          if(match_check == false){
            const warning_msg = await msg.channel.send(embed.setDescription("Wrong Input. Try again"));
            await warning_msg.delete(1000);
            await first_msg.delete();
            await r_message.delete();

            return roleCollector_loop();
          }

          //delete the remainder
          await first_msg.delete();
          await r_message.delete();

        });
      }

      //loop to record how much xp is required for a role to be obtained.
      const expRoleCollector_loop = async function(){
        embed.setDescription("How much XP is required to obtain a mentioned role? Type cancel if you wish to exit.")

        const second_msg = await msg.channel.send(embed);

        //define a regex to check if entered string is just numbers
        const just_numb = new RegExp("^[0-9]+$");

        msg_collector.once('collect', async xp_message => {
          if(xp_message.content.toLowerCase() == "cancel" || xp_message.content.toLowerCase().includes("%r.setup")){
            msg_collector.stop();

            await second_msg.delete();
            await xp_message.delete();

            return (await msg.channel.send("`Operation Cancelled`")).delete(1000);
          }

          //an if-else statement if successful, proceed to prompt for confirmation, if not let the user know they entered the wrong value
          if(just_numb.test(xp_message.content)){
            //check if number isn't too big
            if(Number(xp_message.content) >= 999999999){
              const warning_msg = await msg.channel.send(embed.setDescription("Number is too high. Try a different one."));
              await warning_msg.delete(2000);
              await second_msg.delete();
              await xp_message.delete();
  
              return expRoleCollector_loop();
            }

            role_xp = xp_message.content;

            embed.setDescription("Would you like to confirm? [Y/N]")
                 .addField("`Role Name:`", role_name, true)
                 .addField("`Required XP`", role_xp, true);
            
            const third_msg = await msg.channel.send(embed);

            embed.fields.splice(0, embed.fields.length)

            //delete the remainder
            await second_msg.delete();
            await xp_message.delete();

            msg_collector.once('collect', async confirm_msg =>{
              if(confirm_msg.content.toLowerCase() == "y"){
                //delete the remainder
                await third_msg.delete();
                await confirm_msg.delete();

                //fill out json for processing
                let rep_json = db_pull_result.rows[0].ranks_feature;

                //send data to assist function to process and then update the db
                //if operation is successful, it will send a msg to chat notifying of success, if not
                // will send a message notifying of failure.
                const role_data = role_name + ";" + role_xp;
                await module.exports.rep_setUp_assist(msg, role_data, rep_json, pool);

                return msg_collector.stop();
              }
              else if(confirm_msg.content.toLowerCase() == "n"){
                (await msg.channel.send(embed.setDescription("`Operation Cancelled`"))).delete(1000);

                //delete the remainder
                await third_msg.delete();
                await confirm_msg.delete();

                return msg_collector.stop();
              }
              else{
                (await msg.channel.send(embed.setDescription("`Unknown entry. Operation Cancelled`"))).delete(1000);

                //delete the remainder
                await third_msg.delete();
                await confirm_msg.delete();

                return msg_collector.stop();
              }
            })
          }

          //else statement that notifies user of their error input
          else{
            const warning_msg = await msg.channel.send(embed.setDescription("Your Message contains symbols and/or letters, has to be just numbers (int). Try Again."));
            await warning_msg.delete(2500);
            await second_msg.delete();
            await xp_message.delete();

            return expRoleCollector_loop();
          }
        })
      }

      //initiate the loop
      roleCollector_loop();

    }

  },

  rep_remove_role: function(prefix, msg, pool){
    const ranks_exp = new RegExp("^" + prefix + "rep\.remrole ");
  },

  rep_exp_msg: function(msg, pool){
    //feature that keeps track of messages with 1% chance of firing off (considering 0.5 % chance)
  },

  rep_grant_xp: async function(prefix, msg, client, pool){
    const rep_xp_ref = new RegExp("^" + prefix + "rep\.grantxp .*? [0-9]+");
    const rep_xp_id = new RegExp("^" + prefix + "rep\.grantxp [0-9]+ [0-9]+")
    const check_admin = msg.member.hasPermission("ADMINISTRATOR") == true;
    const query = msg.content.toLowerCase().trim();

    //ensure that the command is being ran by an admin 
    if((rep_xp_id.test(query) || rep_xp_ref.test(query)) && check_admin == true){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;

      msg.channel.startTyping();

      let user_info;

      //check if it's id or user reference
      if(rep_xp_id.test(query)) user_info = (msg.content.replace(prefix + "rep.grantxp ", "")).split(" ");
      else if(rep_xp_ref.test(query)){
        user_info = (msg.content.replace(prefix + "rep.grantxp ", "")).split(" ");

        //check if it's a reference and not a string
        if(!/^<.*?[0-9]>/.test(user_info[0])) return msg.channel.send("`Invalid user reference, try again.`");

        user_info[0] = msg.mentions.members.array()[0].id;
      }
      
      //user verification
      if(module.exports.user_exists(user_info[0], pool, msg.guild) == false){
        return msg.channel.send("`User isn't a part of the guild or broken user.`");
      }

      //check so that the number doesn't exceed 999999999
      if(user_info[1] > 999999999){
        return msg.channel.send("`cannot award xp above 999,999,999. Try again.`")
      }

      //add xp and do additional checks
      const result = await module.exports.user_add_xp(user_info[0], pool, msg.guild, user_info[1]);

      msg.channel.stopTyping();

      if(result == false){
        return msg.channel.send(`\`Unable to grant any rep xp to\` -<@${user_info[0]}>-. \`Try Again.\``)
      }

      const name = (await assist_func.id_to_user(user_info[0], client, msg)).username;

      msg.channel.send("`Operation complete. User: -" + name + "- got awarded -" + user_info[1] + "- rep xp.`")
    }
  },

  rep_remove_xp: function(prefix, msg, pool){

  },

  rep_onoff_user: function(prefix, msg, client, pool){
    //pull db data
    //check if it contains a template or holds actual data
    //if former, then proceed to prompt for rank-set-up function from a user with message collector
    //only admins can have access to this command.
  },

  /**
   * @name rep_board(...)
   * 
   * @description : Shows a board of roles and required xp to obtain them
   *                Shows board of people from highest xp to lowest
   *                Shows people for whom feature is disabled
   * 
   * @param {String} prefix 
   * @param {MESSAGE} msg 
   * @param {PSQL} pool 
   */
  rep_board: async function(prefix, msg, client, pool){
    const rep_board = new RegExp("^" + prefix + "rep\.board");
    const rep_members = new RegExp("^" + prefix + "rep\.xpboard"); // show top 10 

    if(rep_board.test(msg.content.toLowerCase().trim()) || rep_members.test(msg.content.toLowerCase().trim())){
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;

      msg.channel.startTyping();

      //pull latest db data to be written to
      let db_pull_result;
      try{
        db_pull_result = await pool.query('SELECT users, ranks_feature FROM guilds WHERE (gid = $1)', [msg.guild.id]);
        msg.channel.stopTyping();
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);
      }

      const roles = db_pull_result.rows[0].ranks_feature.roles;
      const users = db_pull_result.rows[0].users;
      const range_array = [];

      let desc_str = "";
      let title = "";
      let user_xp = 0;
        
      for(let user in users.users){
        if(user == msg.member.id) user_xp = users.users[user]
      }

      //sequence for rep.board
      if(rep_board.test(msg.content.toLowerCase().trim())){
        title = "Rep info";

        for(let role in roles){
          if((await module.exports.role_exists(role, pool, msg.guild)) == true){
            range_array.push(roles[role])
          }
        }

        //if array is empty, add a desc as the following:
        if(range_array.length == 0) desc_str = "```No ranks to display.```";

        //sort in ascending order
        range_array.sort(function(a, b){return a-b});

        for(let i = 0; i < range_array.length; i++){
          for(let role in roles){
            if(range_array[i] == roles[role]){
              //find a corresponding role
              const role_name = msg.guild.roles.find(val => val.id === role).name

              desc_str += `\`${i}\.\` 「 **${role_name}** : *${range_array[i]}* 」 \n`
            }

            //in case the number of total characters exceeds 1950, send current info, wipe the const, keep doing it until there are no more roles
            if(desc_str.length >= 1950){
              const embed_fallback = new Discord.RichEmbed()
                                         .setTitle(title)
                                         .setDescription(desc_str)
                                         .setFooter("Your rep xp: " + user_xp)

              await msg.channel.send(embed_fallback);

              desc_str = "";
            }
          }
        }
      }

      //sequence for rep.xpboard
      else if(JSON.stringify(users) != "{\"users\":{}}"){
        title = "Rep xp board:"

        for(let user in users.users){
          range_array.push(users.users[user])
        }

        //sort in ascending order
        range_array.sort(function(a, b){return b-a})
        
        if(range_array.length > 10) range_array.splice(10, range_array.length);

        let count = 0;

        for(let i = 0; i < 10; i++){
          for(let user in users.users){
            if(users.users[user] == range_array[i]){
              const user_name = await assist_func.id_to_user(String(user), client, msg);

              desc_str += `\`${count}\` -「 **${user_name}** = { **rep_xp** : *${range_array[i]}* } 」\n  \n`;
              count++
            }

            //prevent loop running for more than necessary
            if(i > range_array.length){
              break;
            }
          }
        }
      }

      //in case of a template
      else{
        title = "Top users - xp board:"
        desc_str = "```No active participants of this feature currently available```"
      }

      const embed = new Discord.RichEmbed()
                        .setTitle(title)
                        .setDescription(desc_str)
                        .setFooter("Your rep xp: " + user_xp)

      msg.channel.send(embed);
      
    }    
  }
}