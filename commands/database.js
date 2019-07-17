const uuidv4 = require('uuid/v4');

module.exports = {
  /**
   * @name gatherData(...)
   * @param {guild} guild_1 
   * @param {PSQL} pool 
   * @description : populates database with necessary templates and data
   */
  gatherData: function(guild_1, pool){
    if(guild_1 !== undefined){ 
      //define all the necessary vars for the db
      var json_channels = JSON.parse("{}"), object = new Object();

      guild_1.channels.forEach(channel => {
        if(channel.type != "text") return;

        object["no_message"] = 0;
        json_channels[channel.id] = object;
      });
      
      // *Creates an object with a necessary structure for JSON column "content_response"
      var json_messages = {
        "no_message" : {
          "res_messages" : [],
          "attachments" : []
        }
      };

      // *Populates the table guilds with data (generates uuid, grabs id and name)
      pool.query('INSERT INTO guilds VALUES ($1, $2);',[uuidv4(), guild_1.id]) 
        .then((result) =>{
          
          // *Populates the table words using previously created objects json_messages and json_channels
          pool.query('INSERT INTO words VALUES($1, (SELECT uugid FROM guilds WHERE (gid = $2)), $3, $4);', [uuidv4(), guild_1.id, JSON.stringify(json_messages), JSON.stringify(json_channels)])
            .catch((err) => {
              return console.error('Error executing query', err.stack);
            });
        })

        .catch((err) =>{
          pool.query('UPDATE words SET content_response = $1, count_stats = $2, words_peruser = $3 WHERE(uugid = (SELECT uugid FROM guilds WHERE (gid = $4)));', [JSON.stringify(json_messages), JSON.stringify(json_channels), JSON.stringify(''),guild_1.id])
            .then((result) =>{
              console.log("It was a success.");
            })
            .catch((err)=>{
              console.error('Error executing query', err.stack);
            })
          
          //console.error('Error executing query', err.stack);
          return;
        });
      }
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
      var json_countStats = result.rows[0].count_stats;
      var json_contentResponse = result.rows[0].content_response;
      
      for(var key in json_contentResponse){
        var content_channel = {};
        content_channel[key] = 0;
        json_countStats[channel.id] = content_channel;
      }

      pool.query('UPDATE words SET count_stats = $1 FROM guilds WHERE(guilds.gid = $2 AND guilds.uugid = words.uugid)',[JSON.stringify(json_countStats), channel.guild.id])
        .catch((err)=>{
          console.error('Error executing query', err.stack);
          return;
        }); 
    })
    .catch((err)=>{
      console.error('Error executing query', err.stack);
      return;
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
        var json_countStats = result.rows[0].count_stats;
        delete json_countStats[channel.id];

        pool.query('UPDATE words SET count_stats = $1 FROM guilds WHERE(guilds.gid = $2 AND guilds.uugid = words.uugid)',[JSON.stringify(json_countStats), channel.guild.id])
          .catch((err)=>{
            console.error('Error executing query', err.stack);
            return;
          });
      })
      .catch((err)=>{
        console.error('Error executing query', err.stack);
        return;
      });
  }
}