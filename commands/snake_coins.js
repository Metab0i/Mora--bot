const Discord = require('discord.js');
const assist_func = require('./assist_functions');

module.exports = {
  add_user: function(prefix, msg, pool){
    //add a user to the db ONLY if they get their first coin:
    //they would either have to be given a coin 
  },

  give_coin: function(prefix, msg, pool, client){
    //give someone a coin out of your bank
  },

  bundle_coins: function(prefix, msg, pool, client){
    //once every 24 hours a user can discover a bundle of coins! 6 rarities, every time there's a different kind of story of how they found the package.
  },

  earn_coins: function(prefix, msg, pool, client){
    //everytime someone !d bumps a server, they get 3 coins as a reward
  },

  coin_board: function(prefix, msg, pool, client){
    //shows who has the most coins on the server
  }

  /**
   * TODO:
   * 1) Make a table 
   *    a. Columns -> uugid, useruuid, userid, json_ofAlltheirData
   *    b. Columns -> uugid, json_ofTheWholeServer(every user on the server etc etc etc)
   *    c. Columns -> uugid, useruuid, userid, coins_total, last_time_bundle_use
   * note: names for columns aren't final, they are primarily to make it easier to understand the gist
   */


}