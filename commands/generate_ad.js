const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const ad_resources = require("../json files/ad_resources.json");

module.exports = {
  /**
   * @name gen_ad(...)
   * 
   * @description : generate short ad-ments for why someone should join something by grabbing words from json file and adding them together appropriately 
   * @param {String} prefix 
   * @param {String} msg 
   */
  gen_ad: function(prefix, msg){
    if(msg.content.toLowerCase() == prefix + "gen_ad"){
      if(msg.author.bot == true) return true;

      const start_str = "join to ";

      const verb = assist_func.random_number(0, 1) == 0 ?
                      ad_resources["meme_stack"].verbs[assist_func.random_number(0, ad_resources["meme_stack"].verbs.length-1)] + " " :
                          ad_resources.verbs[assist_func.random_number(0, ad_resources.verbs.length-1)].present + " ";
      const noun = assist_func.random_number(0, 1) == 0 ?
                      ad_resources["meme_stack"].nouns[assist_func.random_number(0, ad_resources["meme_stack"].nouns.length-1)] + " " :
                          ad_resources.nouns[assist_func.random_number(0, ad_resources.nouns.length-1)] + " ";
      const adj = ad_resources.adjs[assist_func.random_number(0, ad_resources.adjs.length-1)] + " ";
      const adverbs = ad_resources.adverbs[assist_func.random_number(0, ad_resources.adverbs.length-1)] + " ";
      const er_verbs = ad_resources.ergative_verbs[assist_func.random_number(0, ad_resources.ergative_verbs.length-1)] + " ";
      const dir = ad_resources.direction[assist_func.random_number(0, ad_resources.direction.length-1)] + " ";

      switch(assist_func.random_number(0,9)){
        case 0:
          msg.channel.send(start_str + verb + noun);
          break;
        case 1:
          msg.channel.send(start_str + verb + adverbs);
          break;
        case 2:
          msg.channel.send(start_str + verb + adj + noun);
          break;
        case 3:
          msg.channel.send(start_str + verb + noun + adverbs);
          break;
        case 4:
          msg.channel.send(start_str + er_verbs + noun + "'s" + assist_func.random_number(0, 1) == 0 ?
                              ad_resources["meme_stack"].nouns[assist_func.random_number(0, ad_resources["meme_stack"].nouns.length-1)] :
                                  ad_resources.nouns[assist_func.random_number(0, ad_resources.nouns.length-1)])
          break;
        case 5:
          msg.channel.send(start_str  + verb + adj.trim() + "ly");
          break;
        case 6:
          msg.channel.send(start_str + er_verbs + adj + noun);
          break;
        case 7:
          msg.channel.send(start_str + verb + dir + noun)
          break;
        case 8:
          msg.channel.send(start_str + verb + dir + adj + noun)
          break;
        case 9:
          msg.channel.send(start_str + verb + dir + adj + noun);
      }
    }
  }

}