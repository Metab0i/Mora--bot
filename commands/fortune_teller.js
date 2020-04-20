const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const ad_resources = require("../json files/ad_resources.json");

module.exports = {
  /**
   * @name fortune(...)
   * 
   * @description : generate a random fortune by randomly selecting a word from json file, combine them appropriately 
   * @param {String} prefix 
   * @param {Message} msg 
   */
  fortune: async function(prefix, msg){
    if(msg.content.toLowerCase() == prefix + "fortune"){
      if(msg.author.bot == true) return true;

      const noun = assist_func.random_number(0, 100) > 35?
                      ad_resources["meme_stack"].nouns[assist_func.random_number(0, ad_resources["meme_stack"].nouns.length-1)] + " " :
                          ad_resources.nouns[assist_func.random_number(0, ad_resources.nouns.length-1)] + " ";
      const adj = ad_resources.adjs[assist_func.random_number(0, ad_resources.adjs.length-1)] + " ";
      const adverbs = ad_resources.adverbs[assist_func.random_number(0, ad_resources.adverbs.length-1)] + " ";
      const er_verbs = ad_resources.ergative_verbs[assist_func.random_number(0, ad_resources.ergative_verbs.length-1)] + " ";
      const date = assist_func.random_number(0,1) == 0 ? " days" : " months";

      let embed = new Discord.MessageEmbed()
        .setTitle("Your future tells me...")
        .setColor(assist_func.random_hex_colour())
        .setFooter("🥠")

      msg.channel.send("`Looking into your future...`").then(async message => {
        setTimeout(() =>{
          message.edit(":fortune_cookie:")
        }, 1000);

        message.delete({timeout: 1500});
      })


      switch(assist_func.random_number(0,3)){
        case 0:
          embed.setDescription("In " + assist_func.random_number(2, 1000) + date + " you will encounter " + noun + ", this will cause you to " + (assist_func.random_number(0,1) == 0 ? er_verbs + "yourself" : ad_resources["meme_stack"].verbs[assist_func.random_number(0, ad_resources["meme_stack"].verbs.length-1)]));
          break;
        case 1:
          embed.setDescription("You will " + er_verbs + "your " + noun + ", it will finally make you feel " + (assist_func.random_number(0, 1) == 0 ? adj : adverbs + adj));
          break;
        case 2:
          embed.setDescription("One day you will " + er_verbs + "yourself whilst feeling " + (assist_func.random_number(0, 1) == 0 ? adj : adverbs + adj));
          break;
        case 3:
          embed.setDescription("Someday, your " + noun + "will " + (assist_func.random_number(0,1) == 0 ? er_verbs : ad_resources["meme_stack"].verbs[assist_func.random_number(0, ad_resources["meme_stack"].verbs.length-1)] + " ") + "in a very " + adj + "manner.");
          break;
      }

      setTimeout(() =>{
        msg.channel.send(embed);
      }, 1800);
      
    }
  }

}