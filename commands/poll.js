const assist_func = require('./assist_functions');
const Discord = require('discord.js');

module.exports = {
  poll: async function(prefix, msg, client){
    let poll_check = new RegExp("^" + prefix + "poll .*? (.or) .*?", "g");

    if(poll_check.test(msg.content.toLowerCase())){

      if(assist_func.userTimeOut(msg) == true || msg.content.slice(msg.content.indexOf(" ") + 1, msg.content.length).trim() == "") return;

      let poll_array = msg.content.replace("%poll", "").split('.or');

      if(poll_array.length > 9) return msg.channel.send("`Exceeded the maximum number of poll items.`");

      let embed = new Discord.RichEmbed()
        .setAuthor(`@${msg.author.username} - Poll initiator`, msg.author.avatarURL)
        .setColor(assist_func.random_hex_colour())
        .setDescription("`Poll has been initiated. Be sure to cast your vote for an item of your preference.`")
        .setFooter("Poll will last for 60 seconds. After that the winner will be announced.")

      let poll_emojis = [];
      
      for(var index = 0; index < poll_array.length; index++){
        if(poll_array[index].trim() != ""){
          let emoji_index = assist_func.random_number(0, client.emojis.array().length-1);
          
          while(poll_emojis.includes(client.emojis.array()[emoji_index].id)){
            emoji_index = assist_func.random_number(0, client.emojis.array().length)
          }

          poll_emojis.push(client.emojis.array()[emoji_index].id)
          
          embed.addField(`"${client.emojis.get(poll_emojis[index])}"`, poll_array[index].length > 1000 ? poll_array[index].slice(0, 950) + "..." : poll_array[index], true);
        }
        
        else{
          poll_array.splice(index, 1);
          index--;
        }
      }

      const message = await msg.channel.send(embed);
      
      for(var index = 0; index < poll_emojis.length; index++){
        await message.react(client.emojis.get(poll_emojis[index]));
      }

      setTimeout(() => {
        let winner;
        let score = 0;
        let tie_status = false;

        message.reactions.array().forEach(reaction => {
          if(reaction.count > score) {
            score = reaction.count;
            winner = reaction
            tie_status = false;
          }

          if(reaction.count == winner.count && reaction.emoji.id != winner.emoji.id) tie_status = true;
        })

        if(tie_status != true){
          const text_index = poll_emojis.indexOf(winner.emoji.id)

          const announce_embed = new Discord.RichEmbed()
            .setAuthor(`@${msg.author.username} - Poll initiator`, msg.author.avatarURL)
            .setColor(assist_func.random_hex_colour())
            .setDescription("**The winner is:** \"" + `${winner.emoji}\"\n\n` + "-" + poll_array[text_index].trim() + "-")
          
          msg.channel.send(announce_embed);
        }else{
          msg.channel.send("`It was a tie between some items. Poll is deemed invalid.`")
        }

        message.delete(0);
      
      }, 60000);

    }
  }

}