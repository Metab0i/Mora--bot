const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const rep_base = require('./reputation.js');

module.exports = {
    obtain_role: async function(prefix, msg, pool){
        const ob_role_regex = new RegExp(prefix + "rep.purole .*?");

        if(ob_role_regex.test(msg.content.toLowerCase())){
            if(assist_func.userTimeOut(msg) == true) return;

            msg.channel.startTyping();

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
            msg.guild.roles.forEach(role =>{
                if(role.name.toLowerCase() == role_name && rep_ranks.roles[role.id] != undefined){
                    match_check = true;
                    role_id = role.id;
                }
            })

            //check if status is on for the feature to be used
            if(rep_ranks.status != 'TRUE') msg.channel.send("`Feature isn't enabled for this server, please enable the Reputation feature first. [rep.onoff]`");

            //check if role is a part of the guild
            if(!match_check) msg.channel.send("`Role doesn't exist in this guild or within database, please try again.`");

            msg.channel.stopTyping();
        }
    }
}