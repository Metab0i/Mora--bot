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
            
            console.log(rep_ranks);
            console.log(rep_users);
            //check if role exists within the guild
            msg.guild.roles.forEach(role =>{
                if(role.name.toLowerCase() == role_name && rep_ranks.roles[role.id] != undefined){
                    match_check = true;
                    role_id = role.id;
                }
            })

            //check if status is on for the feature to be used
            if(rep_ranks.status != 'TRUE') return msg.channel.send("`Feature isn't enabled for this server, please enable the Reputation feature first. [rep.onoff]`");

            //check if role was validated
            if(!match_check) return msg.channel.send("`Role doesn't exist in this guild or within database, please try again.`");

            //proceed to inquire if the user is sure about moving on
            const embed = new Discord.RichEmbed()
                                .setTitle("Are you sure?")
                                .addField("You are purchasing:", "```" + (role_name.charAt(0).toUpperCase() + role_name.slice(1)) + " for - " + rep_ranks.roles[role_id] + "xp```")
                                .setFooter("Do you wish to proceed? [Y/N].");

            msg.channel.send(embed);

            msg_collector.once('collect', async r_message => {
                if(r_message.content.toLowerCase() == "y"){
                    console.log(rep_users.users[msg.member.id]);
                }
                else{
                    msg.channel.send("`Operation Cancelled.`");
                }

                msg_collector.stop();
            })

            msg.channel.stopTyping();
        }
    }
}