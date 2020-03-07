const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const rep_base = require('./reputation.js');

module.exports = {
    /**
     * @name obtain_role(...)
     * 
     * @description : allows a user to obtain a role for a specific amount of xp. Validate pre-requisites, Prompt a user,
     *                if successful, then proceed to deduct appropriate amount from their xp balance, if not successful,
     *                proceed to notify a user about what went wrong.
     * 
     * @param {String} prefix 
     * @param {Message} msg 
     * @param {PSQL} pool 
     */
    obtain_role: async function(prefix, msg, pool){
        const ob_role_regex = new RegExp(prefix + "rep.purole .*?");

        if(ob_role_regex.test(msg.content.toLowerCase())){
            if(assist_func.userTimeOut(msg) == true) return;

            msg.channel.startTyping();

            const user_id = msg.author.id;
            const rep_ranks = await rep_base.rep_ranks_query(msg.guild, pool);
            const rep_users = await rep_base.rep_users_query(msg.guild, pool);
            const role_name = msg.content.toLowerCase().trim().replace(prefix + "rep.purole ", "");
            const msg_collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                time: 60000,
                max: 1000,
                maxMatches: 3000
            })

            let match_check = false;
            let role_id = 0;
            let role_obj;
        
            //check if role exists within the guild
            msg.guild.roles.cache.forEach(role =>{
                if(role.name.toLowerCase() == role_name && rep_ranks.roles[role.id] != undefined){
                    match_check = true;
                    role_id = role.id;
                    role_obj = role;
                }
            })

            //check if user already has the role
            if(msg.member.roles.cache.find(val => val.id === role_id) != undefined) {
                msg.channel.stopTyping();
                return msg.channel.send("`You already own this role, try a different one.`");
            }

            //check if status is on for the feature to be used
            if(rep_ranks.status != 'TRUE') {
                msg.channel.stopTyping();
                return msg.channel.send("`Feature isn't enabled for this server, please enable the Reputation feature first. [rep.onoff]`");
            }

            //check if role was validated
            if(!match_check) {
                msg.channel.stopTyping();
                return msg.channel.send("`Role doesn't exist in this guild or within database, please try again.`");
            }

            //proceed to inquire if the user is sure about moving on
            const embed = new Discord.MessageEmbed()
                                .setTitle("Are you sure?")
                                .addField("-You are purchasing:-", "```" + (role_name.charAt(0).toUpperCase() + role_name.slice(1)) + " for - " + rep_ranks.roles[role_id] + "xp```")
                                .addField("-Your current xp balance:-", "```" + rep_users.users[user_id].xp.xp_amount + "xp```")
                                .setFooter("Do you wish to proceed? [Y/N].");

            msg.channel.stopTyping();

            const msg_prompt = await msg.channel.send(embed);

            msg_collector.once('collect', async r_message => {
                if(r_message.content.toLowerCase() == "y"){

                    if((Number(rep_users.users[user_id].xp.xp_amount) - Number(rep_ranks.roles[role_id])) >= 0){
                        msg_prompt.delete(5000);

                        //deduct xp from a user xp total
                        rep_users.users[user_id].xp.xp_amount -= Number(rep_ranks.roles[role_id]);
                        
                        //update db with latest data
                        try{
                            await pool.query('UPDATE guilds SET users = $1 WHERE (gid = $2)', [rep_users, msg.guild.id]);
                        }catch(err){
                            return console.error('on [ obtain_role function ]\n', err.stack);
                        }

                        //assign said role
                        msg.member.roles.add(role_obj);

                    }else{
                        const msg_notif = await msg.channel.send("`Insufficient amount of xp. You have: " + (rep_users.users[user_id].xp.xp_amount == undefined ? 0 : rep_users.users[user_id].xp.xp_amount) + ", Required amount: " + rep_ranks.roles[role_id] + "`");
                        msg_notif.delete(7000);
                        msg_prompt.delete(7000);
                    }

                }
                else{
                    const msg_notif = await msg.channel.send("`Operation Cancelled.`");
                    msg_notif.delete(7000);
                    msg_prompt.delete(7000);
                }

                msg_collector.stop();
            })
        }
    },

    /**
     * @name sell_role(...)
     * 
     * @description : Functionality is similar to obtain_role(...), however in this case role is being taken off a user and xp granted.
     * @param {String} prefix 
     * @param {Message} msg 
     * @param {PSQL} pool 
     */
    sell_role: async function(prefix, msg, pool){
        const ob_role_regex = new RegExp(prefix + "rep.sellrole .*?");

        if(ob_role_regex.test(msg.content.toLowerCase())){
            if(assist_func.userTimeOut(msg) == true) return;

            msg.channel.startTyping();

            const user_id = msg.author.id;
            const rep_ranks = await rep_base.rep_ranks_query(msg.guild, pool);
            const rep_users = await rep_base.rep_users_query(msg.guild, pool);
            const role_name = msg.content.toLowerCase().trim().replace(prefix + "rep.purole ", "");
            const msg_collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                time: 60000,
                max: 1000,
                maxMatches: 3000
            })

            let match_check = false;
            let role_id = 0;
        
            //check if role exists within the guild
            msg.guild.roles.cache.forEach(role =>{
                if(role.name.toLowerCase() == role_name && rep_ranks.roles[role.id] != undefined){
                    match_check = true;
                    role_id = role.id;
                }
            })

            //check if user already has the role
            if(msg.member.roles.cache.find(val => val.id === role_id) == undefined) {
                msg.channel.stopTyping();
                return msg.channel.send("`You don't own this role for it to be sold, try the one you already own.`");
            }

            //check if status is on for the feature to be used
            if(rep_ranks.status != 'TRUE') {
                msg.channel.stopTyping();
                return msg.channel.send("`Feature isn't enabled for this server, please enable the Reputation feature first. [rep.onoff]`");
            }

            //check if role was validated
            if(!match_check) {
                msg.channel.stopTyping();
                return msg.channel.send("`Role doesn't exist in this guild or within database, please try again.`");
            }

            //proceed to inquire if the user is sure about moving on
            const embed = new Discord.MessageEmbed()
                                .setTitle("Are you sure?")
                                .addField("-You are selling:-", "```" + (role_name.charAt(0).toUpperCase() + role_name.slice(1)) + " for - " + (rep_ranks.roles[role_id] / 2) + "xp```")
                                .addField("-Your xp balance post sale:-", "```" + rep_users.users[user_id].xp.xp_amount + (rep_ranks.roles[role_id] / 2) + "xp```")
                                .setFooter("Do you wish to proceed? [Y/N].");

            msg.channel.stopTyping();

            const msg_prompt = await msg.channel.send(embed);

            msg_collector.once('collect', async r_message => {
                if(r_message.content.toLowerCase() == "y"){

                    if((Number(rep_users.users[user_id].xp.xp_amount) + Number(rep_ranks.roles[role_id]/2)) <= 999999999){
                        msg_prompt.delete(5000);

                        //add xp to user's xp total
                        rep_users.users[user_id].xp.xp_amount += Number(rep_ranks.roles[role_id]/2);
                        
                        //update db with latest data
                        try{
                            await pool.query('UPDATE guilds SET users = $1 WHERE (gid = $2)', [rep_users, msg.guild.id]);
                        }catch(err){
                            return console.error('on [ obtain_role function ]\n', err.stack);
                        }

                        //assign said role
                        msg.member.removeRole(role_id);

                    }else{
                        const msg_notif = await msg.channel.send("`Cannot proceed with sale, your account will exceed 999,999,999`");
                        msg_notif.delete(7000);
                        msg_prompt.delete(7000);
                    }

                }
                else{
                    const msg_notif = await msg.channel.send("`Operation Cancelled.`");
                    msg_notif.delete(7000);
                    msg_prompt.delete(7000);
                }

                msg_collector.stop();
            })
        }
    }


}