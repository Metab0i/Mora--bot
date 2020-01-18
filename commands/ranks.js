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
  ranks_set_up: function(prefix, msg, pool, client){
    
    client.on('message', async message => {

    });

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