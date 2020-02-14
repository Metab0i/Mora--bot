const uuidv4 = require('uuid/v4');

/**
 * NOTES:
 * As long as db contains the right column names and proper data type, there need not be any default values.
 */

module.exports = {
  /**
   * @name gatherData(...)
   * @param {guild} guild_1 
   * @param {PSQL} pool 
   * @description : populates database with necessary templates and data
   */
  gatherData: function(guild_1, pool){
    if(guild_1 !== undefined){ 
      //define all the necessary lets for the db
      let json_channels = JSON.parse("{}"), object = new Object();

      guild_1.channels.forEach(channel => {
        if(channel.type != "text") return;

        object["no_message"] = 0;
        json_channels[channel.id] = object;
      });
      
      // *Creates an object with a necessary structure for JSON column "content_response"
      let json_messages = {
        "no_message" : {
          "res_messages" : [],
          "attachments" : []
        }
      };

      const json_users = JSON.parse("{ \"users\" : {} }")

      const json_ranks = JSON.parse("{ \"status\" : \"FALSE\", \"roles\" : {\"\" : \"\"} }");

      // *Populates the table guilds with data (generates uuid, grabs id and name)
      pool.query('INSERT INTO guilds VALUES ($1, $2, $3, $4);',[uuidv4(), guild_1.id, JSON.stringify(json_users), JSON.stringify(json_ranks)])
        .then((result) =>{
          
          // *Populates the table words using previously created objects json_messages and json_channels
          pool.query('INSERT INTO words VALUES($1, (SELECT uugid FROM guilds WHERE (gid = $2)), $3, $4);', [uuidv4(), guild_1.id, JSON.stringify(json_messages), JSON.stringify(json_channels)])
            .catch((err) => {
              return console.error('on GatherData function;', err.stack);
            });
        })

        .catch((err) =>{
          //update guild table
          pool.query('UPDATE guilds SET users = $1, ranks_feature = $2 WHERE(uugid = (SELECT uugid FROM guilds WHERE (gid = $3)));', [JSON.stringify(json_users), JSON.stringify(json_ranks), guild_1.id])
            .catch((err)=>{
              return console.error('on GatherData db function;', err.stack);
            })
          
          //update words table
          pool.query('UPDATE words SET content_response = $1, count_stats = $2, words_peruser = $3 WHERE(uugid = (SELECT uugid FROM guilds WHERE (gid = $4)));', [JSON.stringify(json_messages), JSON.stringify(json_channels), JSON.stringify(''),guild_1.id])
            .then((result) =>{
              return console.log("Status: success");
            })
            .catch((err)=>{
              return console.error('on GatherData db function;', err.stack);
            })
        });
      }
  },

  /**
   * @name removeGuild(...)
   * @param {guild} guild_1 
   * @param {PSQL} pool 
   * @description : removes the guild from the db
   */
  removeGuild: function(guild_1, pool){
    pool.query('DELETE FROM words WHERE(words.uugid = (SELECT uugid FROM guilds WHERE(guilds.gid = $1))) ',[guild_1.id])
      .then((result)=>{
        
        pool.query('DELETE FROM guilds WHERE(guilds.gid = $1)',[guild_1.id])
          .catch((err)=>{
            return console.error('on removeGuild db function;', err.stack);
          });

      })
      .catch((err)=>{
        return console.error('on removeGuild db function;', err.stack);
      });
  },

  /**
   * @name addChannel(...)
   * @param {Bot} client 
   * @param {PSQL} pool 
   * @param {channel} channel 
   * @description : adds a passed channel to the db
   */
  addChannel: function(pool, channel){
    if(channel.type != "text") return;

    pool.query('SELECT count_stats, content_response FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))',[channel.guild.id])
    .then((result)=>{
      let json_countStats = result.rows[0].count_stats;
      let json_contentResponse = result.rows[0].content_response;
      
      for(let key in json_contentResponse){
        let content_channel = {};
        content_channel[key] = 0;
        json_countStats[channel.id] = content_channel;
      }

      pool.query('UPDATE words SET count_stats = $1 FROM guilds WHERE(guilds.gid = $2 AND guilds.uugid = words.uugid)',[JSON.stringify(json_countStats), channel.guild.id])
        .catch((err)=>{
          return //console.error('on AddChannel db function;', err.stack);
        }); 
    })
    .catch((err)=>{
      return //console.error('on AddChannel db function;', err.stack);
    });
  },

  /**
   * @name deleteChannel(...)
   * @param {PSQL} pool 
   * @param {Channel} channel
   * @description : Deletes a passed channel from the list 
   */
  deleteChannel: function(pool, channel){
    pool.query('SELECT count_stats, content_response FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))',[channel.guild.id])
      .then((result)=>{
        let json_countStats = result.rows[0].count_stats;
        delete json_countStats[channel.id];

        pool.query('UPDATE words SET count_stats = $1 FROM guilds WHERE(guilds.gid = $2 AND guilds.uugid = words.uugid)',[JSON.stringify(json_countStats), channel.guild.id])
          .catch((err)=>{
            return console.error('on DeleteChannel db function;', err.stack);
          });
      })
      .catch((err)=>{
        return console.error('on DeleteChannel db function;', err.stack);
      });
  }
}