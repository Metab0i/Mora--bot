const Discord = require('discord.js');

/**
 * Module Exports, contains main functionality of simple text based
 * commands
 * 
 * The list of functions:
 * - logResponse 
 * - outputResponse
 * - trackStats
 * - showStats
 * - distortText
 * 
 */

 /**
  * @name populateChannelJSON(...)
  * @param {JSON} json_channels 
  * @param {Guild} guild 
  * @param {POOL} pool 
  * @description : Assistant function, populates Json with missing channels and updates the db 
  */
  function populateChannelJSON(json_channels, guild, pool){
    var object = new Object();
    var check = false;

    for(var i = 0; i < guild.channels.size; i++){

      if(!JSON.stringify(json_channels).includes(guild.channels.array()[i].id) && guild.channels.array()[i].type == "text"){
        object["no_message"] = 0;
        json_channels[guild.channels.array()[i].id] = object;

        check = true;
      }
      
    }

    if(check){
      pool.query('UPDATE words SET count_stats = $1 FROM guilds WHERE(guilds.gid = $2 AND guilds.uugid = words.uugid)',[JSON.stringify(json_channels), guild.id])
      .then((result)=>{
        console.log("Updated the table, it was a success");
      })
      .catch((err)=>{
        console.log("it was a failure");
      });
    }
  }

module.exports = {
  /**
   * --------------------------------------------------------------------------------------------------------------------------------------------------------------
   * @name logResponse(msg,pool); 
   * @param {String} msg 
   * @param {Object} pool 
   * @description : Logs stubs and assigns messages/media called "stubbies (or stubby in singular form). Allows to store practically anything. And later, display them by calling
   *                a specific stub.
   * @note : Limit stubby amount. 92 of text and 92 of various media. 184 spaces per stub total. 
   */
  logResponse: function(client,msg,pool){
    if(msg.author.bot == true) return;

    if(/^!stubs "(.*?)"/.test(msg.content.toLowerCase())){
      var stubMax = 92;
      var stubbyMax = 92;

      var json_count;
      var json_content;
      var json_userLimit;
      var resp_template = {
        "res_messages" : [],
        "attachments" : []
      }

      msg.channel.startTyping();

      var msgRecord = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[1];
      var msgResponse = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[3];    

      pool.query('SELECT content_response, count_stats, words_peruser FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))', [msg.guild.id])
        .then((result) => {
          //instantiate the variables
          json_content = result.rows[0].content_response;
          json_count = result.rows[0].count_stats;
          json_userLimit = result.rows[0].words_peruser;

          //if it's the first record, remove no_message template
          if(JSON.stringify(json_content).includes("no_message")) delete json_content.no_message;

          //if json_content doesn't have a stub, then proceed to add a template to the stub
          //if stub exists, check if the user who is calling the command, owns the stub
          if(!JSON.stringify(json_content).includes(msgRecord)) {
            json_content[msgRecord] = resp_template;
          }
          //checks if user owns the stub
          else if(!JSON.stringify(json_userLimit[msg.author.id]).includes(msgRecord)){
            msg.channel.send(msg.author + "` doesn't own the stub. They cannot edit it's stubbies.`");
            msg.channel.stopTyping();
            return;
          }

          //Logical XOR. Checks if response is empty or contains just white spaces or an empty string, or if it already exists.
          if((msgResponse != null ? !/^ *$/.test(msgResponse) : /^ *$/.test(msgResponse)) && !json_content[msgRecord]['res_messages'].includes(msgResponse)){
            json_content[msgRecord]['res_messages'].push(msgResponse);
          }else{
            if(json_content[msgRecord]['res_messages'].includes(msgResponse)){
              msg.channel.send("`This stubby already exists. Try again.`");
              msg.channel.stopTyping();
              msg.delete(60000);
              return;
            }else if(msg.attachments.size <= 0 && msg.embeds.length <= 0){
              msg.channel.send("`Something is wrong with this stubby. Try again.`");
              msg.channel.stopTyping();
              msg.delete(60000);
              return;
            } 
            
          }

          //boolean to monitor the URL duplicates
          var media_present = false;

          if(msg.attachments.size > 0){
            msg.attachments.forEach(function(value,key){
              !json_content[msgRecord]['attachments'].includes(value.proxyURL) ? json_content[msgRecord]['attachments'].push(value.proxyURL) : media_present = true; 
            });
          }
          
          if(msg.embeds.length > 0 ){
            msg.embeds.forEach(function(value){
              !json_content[msgRecord]['attachments'].includes(value.url) ? json_content[msgRecord]['attachments'].push(value.url) : media_present = true; 
            })
          }

          //if boolean passes the check, proceed to notify the user that url already exists within that stub, try a different one.
          if(media_present) {
            msg.channel.send("`Url already exists. Try a different one`");
            msg.channel.stopTyping();
            msg.delete(60000);
            return;
          }

          //boolean to monitor the amount of stubs used up by an individual user.
          var user_check = false;

          //if user isn't a part of the json_userLimit, proceed to add them. Otherwise check if they exceed the number of stubs, if they do notify them.
          if(!JSON.stringify(json_userLimit).includes(msg.author.id)){
            var obj = [msgRecord];
            json_userLimit == null || json_userLimit == "" ? json_userLimit = {} : null;
            json_userLimit[msg.author.id] = obj; 
          }else{
            var obj = json_userLimit[msg.author.id];
            obj.length >= stubMax ? user_check = true : null;
            json_content[msgRecord]['res_messages'].length >= stubbyMax ? user_check = true : null;
            json_content[msgRecord]['attachments'].length >= stubbyMax ? user_check = true : null;

            !JSON.stringify(json_userLimit).includes(msgRecord) ? obj.push(msgRecord) : null;
          }

          //implement the stubby count here!

          if(user_check){
            msg.channel.send(json_userLimit[msg.author.id].length >= stubMax ? "`You exceed the maximum amount of stubs! Remove some, and try again.`" : "`You exceed the maximum amount of stubbies! Remove some, and try again.`");
            msg.delete(60000);
            return;
          }

          for(var key in json_count){
            Object.keys(json_content).forEach(function(key2){
              var obj = json_count[key];
              if(JSON.stringify(obj).includes("no_message")) obj = {};
              obj[key2] = 0;
              json_count[key] = obj;
            })
          }

          // console.log(JSON.stringify(json_content));
          // console.log(JSON.stringify(json_count));
          //console.log(JSON.stringify(json_userLimit));

          pool.query('UPDATE words SET count_stats = $1, content_response = $2, words_peruser = $3 FROM guilds WHERE(guilds.gid = $4 AND guilds.uugid = words.uugid)',[JSON.stringify(json_count), JSON.stringify(json_content), JSON.stringify(json_userLimit), msg.channel.guild.id])
            .then((result) =>{
              msg.channel.send("`Logging was successful. Added data to: \'" + msgRecord + "\'. You have " + (stubMax - json_userLimit[msg.author.id].length) + " stubs left.`");
              msg.channel.send("` " + (stubbyMax - json_content[msgRecord]['res_messages'].length) + " of stubbies left.`");
              msg.channel.send("` " + (stubbyMax - json_content[msgRecord]['attachments'].length) + " of media stubbies left.`");
              msg.channel.stopTyping();
              msg.delete(60000);
            })
            .catch((err)=>{
              console.error('Error executing query', err.stack);
              return;
            });

        }).catch((err) => {
          //msg.channel.send(`\`${err.message}\``);
          msg.channel.stopTyping();
          return console.error('Error executing query', err.stack)
        });
    }    
  },

  /**
   * --------------------------------------------------------------------------------------------------------------------------------------------------------------
   * @param {Discord} client 
   * @param {Message} msg 
   * @param {PSQL} pool 
   */
  deleteStubs: function(client, msg, pool){
    if(msg.author.bot == true) return;
    
    var stubMax = 92;
    var stubbyMax = 92;
    var attachmentsMax = 92;

    if(/^!rmstub "(.*?)"/.test(msg.content.toLowerCase())){
      var json_count;
      var json_content;
      var json_userLimit;

      msg.channel.startTyping();

      var msgRecord = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[1];
      var msgResponse = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[3];

      pool.query('SELECT content_response, count_stats, words_peruser FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))', [msg.guild.id])
        .then((result)=>{
          //instantiate the variables
          json_content = result.rows[0].content_response;
          json_count = result.rows[0].count_stats;
          json_userLimit = result.rows[0].words_peruser;

          // console.log(JSON.stringify(json_content));
          // console.log("\n\n" + JSON.stringify(json_count));
          // console.log("\n\n" + JSON.stringify(json_userLimit));

          //check if stub exists
          if(!JSON.stringify(json_userLimit).includes(msgRecord)){
            msg.channel.send("`Stub doesn't exist. Try a different one.`");
            msg.channel.stopTyping();
            return;
          }

          if(!JSON.stringify(json_content).includes(msgRecord)){
            msg.channel.send("`Stub doesn't exist. Try a different one.`");
            msg.channel.stopTyping();
            return;
          }

          if(!JSON.stringify(json_count).includes(msgRecord)){
            msg.channel.send("`Stub doesn't exist. Try a different one.`");
            msg.channel.stopTyping();
            return;
          }

          if(!JSON.stringify(json_userLimit[msg.author.id]).includes(msgRecord)){
            msg.channel.send("`You do not own this stub.`");
            msg.channel.stopTyping();
            return;
          }

          var obj = json_userLimit[msg.author.id];

          for(var i = 0; i < obj.length; i++){
            if(obj[i] === msgRecord){
              obj.splice(i,1);
              i--;
            }
          }

          //deletes from count
          for(var key in json_count){
            Object.keys(json_content).forEach(function(key2){
              if(key2 == msgRecord){
                delete json_count[key][key2];
              }
            })
          }

          //deletes from content
          delete json_content[msgRecord];

          // console.log("\n-------------------------------------------\n")
          // console.log(JSON.stringify(json_content));
          // console.log("\n\n" + JSON.stringify(json_count));
          // console.log("\n\n" + JSON.stringify(json_userLimit));

          pool.query('UPDATE words SET count_stats = $1, content_response = $2, words_peruser = $3 FROM guilds WHERE(guilds.gid = $4 AND guilds.uugid = words.uugid)',[JSON.stringify(json_count), JSON.stringify(json_content), JSON.stringify(json_userLimit), msg.channel.guild.id])
            .then((result) =>{
              msg.channel.send("`\'" + msgRecord + "\' was successfully removed. You now have " + (stubMax - json_userLimit[msg.author.id].length) + " stub spaces to use.`");
              msg.channel.stopTyping();
              msg.delete(60000);
            })
            .catch((err)=>{
              console.error('Error executing query', err.stack);
              return;
            });

        })
        .catch((err)=>{
          //msg.channel.send(`\`${err.message}\``);
          msg.channel.stopTyping();
          return console.error('Error executing query', err.stack);
        })
    }
    else if(/^!rmallstubs/.test(msg.content.toLowerCase())){
      var json_count;
      var json_content;
      var json_userLimit;

      msg.channel.startTyping();

      var msgRecord = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[1];

      pool.query('SELECT content_response, count_stats, words_peruser FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))', [msg.guild.id])
        .then((result)=>{
          //instantiate the variables
          json_content = result.rows[0].content_response;
          json_count = result.rows[0].count_stats;
          json_userLimit = result.rows[0].words_peruser;

          // console.log(JSON.stringify(json_content));
          // console.log("\n\n" + JSON.stringify(json_count));
          // console.log("\n\n" + JSON.stringify(json_userLimit));

          json_userLimit[msg.author.id].forEach(function(item){
            //deletes from count
            for(var key in json_count){
              Object.keys(json_content).forEach(function(key2){
                if(key2 == item){
                  delete json_count[key][key2];
                }
              })
            }

            //deletes from content
            delete json_content[item];
          });

          json_userLimit[msg.author.id] = [];

          // console.log("\n-------------------------------------------\n")
          // console.log(JSON.stringify(json_content));
          // console.log("\n\n" + JSON.stringify(json_count));
          // console.log("\n\n" + JSON.stringify(json_userLimit));

          pool.query('UPDATE words SET count_stats = $1, content_response = $2, words_peruser = $3 FROM guilds WHERE(guilds.gid = $4 AND guilds.uugid = words.uugid)',[JSON.stringify(json_count), JSON.stringify(json_content), JSON.stringify(json_userLimit), msg.channel.guild.id])
            .then((result) =>{
              msg.channel.send("`All stubs were successfully removed from your list. You now have " + (stubMax - json_userLimit[msg.author.id].length) + " stub spaces.`");
              msg.channel.stopTyping();
              msg.delete(60000);
            })
            .catch((err)=>{
              console.error('Error executing query', err.stack);
              return;
            });

        })
        .catch((err)=>{
          //msg.channel.send(`\`${err.message}\``);
          msg.channel.stopTyping();
          return console.error('Error executing query', err.stack);
        })
    }
    else if(/^!rmsst "(.*?)" "(.*?)"/.test(msg.content.toLowerCase())){
      var json_count;
      var json_content;
      var json_userLimit;

      msg.channel.startTyping();

      var msgRecord = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[1];
      var msgResponse = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[3];  

      pool.query('SELECT content_response, count_stats, words_peruser FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))', [msg.guild.id])
      .then((result)=>{
        //instantiate the variables
        json_content = result.rows[0].content_response;
        json_count = result.rows[0].count_stats;
        json_userLimit = result.rows[0].words_peruser;

        // console.log(JSON.stringify(json_content));
        // console.log("\n\n" + JSON.stringify(json_count));
        // console.log("\n\n" + JSON.stringify(json_userLimit));

        //checks if stub even exists
        if(!JSON.stringify(json_userLimit[msg.author.id]).includes(msgRecord)){
          msg.channel.send("`" + msg.author.username + " doesn't own the stub or this stub doesn't exist.`");
          msg.channel.stopTyping();
          return;
        }
        
        //checks if stubby exists 
        if(!JSON.stringify(json_content[msgRecord]['res_messages']).includes(msgResponse)){
          msg.channel.send("`This stubby doesn't exist.`");
          msg.channel.stopTyping();
          return;
        }

        var obj = json_content[msgRecord]['res_messages'];
        
        for(var i = 0; i < obj.length; i++){
          if(obj[i] === msgResponse){
            obj.splice(i,1);
            i--;
          }
        }

        // console.log("\n-------------------------------------------\n")
        // console.log(JSON.stringify(json_content));
        // console.log("\n\n" + JSON.stringify(json_count));
        // console.log("\n\n" + JSON.stringify(json_userLimit));
        
        pool.query('UPDATE words SET count_stats = $1, content_response = $2, words_peruser = $3 FROM guilds WHERE(guilds.gid = $4 AND guilds.uugid = words.uugid)',[JSON.stringify(json_count), JSON.stringify(json_content), JSON.stringify(json_userLimit), msg.channel.guild.id])
            .then((result) =>{
              msg.channel.send("`\'" + msgResponse + "\' - stubby was successfully removed. TEST: " + (stubMax - json_userLimit[msg.author.id].length)+ "`");
              msg.channel.stopTyping();
              msg.delete(60000);
            })
            .catch((err)=>{
              console.error('Error executing query', err.stack);
              return;
            });

      })
      .catch((err)=>{
        //msg.channel.send(`\`${err.message}\``);
        msg.channel.stopTyping();
        return console.error('Error executing query', err.stack);
      });
    }
  },

  /**
   * --------------------------------------------------------------------------------------------------------------------------------------------------------------
   * @name outputStubs(...)
   * @param {DISCORDJS} client 
   * @param {message} msg 
   * @param {PSQL} pool 
   * @description : outputs a stubby or stubby media that was called. Also keeps track of the number of times it was said. 
   *
   */
  outputStubs: function(client, msg, pool){
    if(msg.author.bot == true) return;

    //logical XOR
    if(/^<!sst "(.*?)"/.test(msg.content.toLowerCase()) ?
        !(/^!sst media "(.*?)"/.test(msg.content.toLowerCase())) :
          /^!sst media "(.*?)"/.test(msg.content.toLowerCase())){
      var json_count;
      var json_content;
      var json_userLimit;

      msg.channel.startTyping();

      var msgResponse = msg.content.replace(msg.content.split(" ", 1)[0], "").split(/"(.*?)"/)[1];
      
      console.log(msgResponse);

      pool.query('SELECT content_response, count_stats, words_peruser FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))', [msg.guild.id])
        .then((result)=>{
          json_content = result.rows[0].content_response;
          json_count = result.rows[0].count_stats;
          json_userLimit = result.rows[0].words_peruser;

          if(/^!sst "(.*?)"/.test(msg.content.toLowerCase())){
            console.log(json_content[msgResponse]['res_messages'][0]);
            msg.channel.send(json_content[msgResponse]['res_messages'][0])
          }
          else if(/^!sst media "(.*?)"/.test(msg.content.toLowerCase())){
            console.log(json_content[msgResponse]['attachments'][0]);
          }
        })
        .catch((err)=>{
          //msg.channel.send(`\`${err.message}\``);
          msg.channel.send('\`Something went wrong. Reminder: I am case-sensitive.\`');
          msg.channel.stopTyping();
          return console.error('Error executing query', err.stack);
        });
        msg.channel.stopTyping();
    }
  },

  /**
   * --------------------------------------------------------------------------------------------------------------------------------------------------------------
   * @name showStats(msg,pool);
   * @param {String} msg 
   * @param {Object} pool 
   * @description : Shows statistics of words that were selected to be tracked (how many times it was said in a particular channel of the guild)
   *                side note-> Does not show response messages. [refer to logResponse]
   * @extra : Make it so when displaying all channels, instead of displaying every single word and the amount, display total for each channel and if user wants to see specifics simply 
   *          tell them to try --showstats current
   */
  showStats: function(client, msg, pool){
    if(msg.author.bot == true) return;

    let pages = [];
    let page = 1; //index of a current page
    let totalWords = 0;
    var json_count;

    //logcial XOR
    if(msg.content.toLowerCase() === ("!outststats") ? 
      msg.content.toLowerCase() !== ("!outststats current") : 
        msg.content.toLowerCase() === ("!outststats current")){

      msg.channel.startTyping();

      pool.query('SELECT count_stats FROM words JOIN guilds ON((words.uugid = guilds.uugid) AND (guilds.gid = $1))', [msg.guild.id])
        .then((result)=>{
          json_count = result.rows[0].count_stats;
          
          if(msg.content.toLowerCase() === "!outststats"){
            var str = "";
            var count = 0;
            
            populateChannelJSON(json_count, msg.guild, pool);
            console.log(JSON.stringify(json_count));
            console.log(msg.guild.name);

            for(var channel in json_count){
              //console.log(msg.guild.channels.get(channel).name.toString());

              str += "```**" + msg.guild.channels.get(channel).name + ":** ```";

              var total_stubCount = 0;

              for(var trackable in json_count[channel]){
                total_stubCount += json_count[channel][trackable];
                //str += " ⑃ *" + trackable + "*: " + json_count[channel][trackable] + " ⑃ ";
                totalWords += json_count[channel][trackable];
              }

              str += " ∘ *Stubs used:* **" + total_stubCount + "** ∘ ";

              str += "\n\n";

              if(count == 6){
                pages.push(str);
                count = 0;
                str = "";
              }

              count++;
            }

            if(count <= 6 && str!= "") pages.push(str);
          
            //create and embed and set initial values
            const embed = new Discord.RichEmbed() //new embed
              .setTitle(`How to use this table: `)
              .setAuthor(`@${msg.author.username} - Current Table User;`, msg.author.avatarURL)
              .setColor(12269369)
              .setFooter(`Page ${page} of ${pages.length}`)
              .setDescription("\nPress ⏪ or ⏩ twice to list through, you only have 120s to interact with the table. If you wish to see more details for a channel, use --showstats current.\nTo Initiate the table, press ⏩.\n\n__Only one user at a time may use the list.__\n\n *Current Table User is displayed above ^.*");
              // console.log("I passed this stage");
            
            //send the created embed, afterwards leave reactions on a current message
            //instead of this, pass an array of things, for example, 0 would be title, 1 would be descriptin and etc etc.
            msg.channel.send(embed).then(message =>{
              message.react('⏪').then( r => {
                message.react('⏩');
                
                //create 2 filters, one for forwards the other one for backwards
                const backwardsFilter = (reaction, usr) => reaction.emoji.name === '⏪' && usr.id === msg.author.id;
                const forwardsFilter = (reaction, usr) => reaction.emoji.name === '⏩' && usr.id === msg.author.id;
                
                //create 2 collectors of reactions, set filters ^
                const backwards = message.createReactionCollector(backwardsFilter, { time: 120000 });
                const forwards = message.createReactionCollector(forwardsFilter, { time: 120000 }); 
                
                //on action, change the values:
                backwards.on('collect', r => { 
                  message.reactions.forEach(function(value){
                    value.remove(msg.author.id);
                  })

                  if (page === 1) return; 

                  page--; 
                  embed.setDescription(pages[page-1]); 
                  embed.setFooter(`Page ${page} of ${pages.length} --- Total on ${msg.guild.name}: ${totalWords}`); 
                  message.edit(embed) 
                })
                
                //on action change the values:
                forwards.on('collect', r => { 
                  message.reactions.forEach(function(value){
                    value.remove(msg.author.id);
                  })
                  
                  if (page === pages.length && pages.length != 1) return;

                  if (pages.length != 1){
                    page++;
                  } 
        
                  embed.setTitle(`Servers Stubs Count Statistics: `)
                  embed.setDescription(pages[page-1]); 
                  embed.setFooter(`Page ${page} of ${pages.length} --- Total on ${msg.guild.name}: ${totalWords}`); 
                  message.edit(embed) 
                })

              })
            })

          }else if(msg.content.toLowerCase() === "!outststats current"){
            var index = 1;
            str = "";
            count = 0;
            totalWords = 0;

            for(value in json_count[msg.channel.id]){
              str += "*" + index + ". -* 「" + value + "」: **" + json_count[msg.channel.id][value] + "** \n ";

              index += 1;
              totalWords += json_count[msg.channel.id][value];
              
              if(count == 12){
                pages.push(str);
                count = 0;
                str = "";
              }

              count++;
            }

            if(count <= 12 && str!= "") pages.push(str);

            const diffEmbed = new Discord.RichEmbed()
              .setTitle("__*"+msg.channel.name + "*__ statistics: ")
              .setAuthor(`@${msg.author.username} - Current Table User;`, msg.author.avatarURL)
              .setFooter(`Page ${page} of ${pages.length} --- Total on this channel: ${totalWords}`)
              .setColor(3564358)
              .setDescription(pages[page-1]+ "\n");

            msg.channel.send(diffEmbed).then(message =>{
              message.react('⏪').then( r => {
                message.react('⏩');

                //create 2 filters, one for forwards the other one for backwards
                const backwardsFilter = (reaction, usr) => reaction.emoji.name === '⏪' && usr.id === msg.author.id;
                const forwardsFilter = (reaction, usr) => reaction.emoji.name === '⏩' && usr.id === msg.author.id;
                
                //create 2 collectors of reactions, set filters ^
                const backwards = message.createReactionCollector(backwardsFilter, { time: 120000 });
                const forwards = message.createReactionCollector(forwardsFilter, { time: 120000 }); 
                
                //on action, change the values:
                backwards.on('collect', r => { 
                  message.reactions.forEach(function(value){
                    value.remove(msg.author.id);
                  })

                  if (page === 1) return; 

                  page--; 
                  diffEmbed.setDescription(pages[page-1] + "\n"); 
                  diffEmbed.setFooter(`Page ${page} of ${pages.length} --- Total on this channel: ${totalWords}`); 
                  message.edit(diffEmbed) 
                })
                
                //on action change the values:
                forwards.on('collect', r => { 
                  message.reactions.forEach(function(value){
                    value.remove(msg.author.id);
                  })

                  if (page === pages.length && pages.length != 1) return;

                  if (pages.length != 1){
                    page++;
                  } 
        
                  diffEmbed.setDescription(pages[page-1] + "\n");
                  diffEmbed.setFooter(`Page ${page} of ${pages.length} --- Total on this channel: ${totalWords}`); 
                  message.edit(diffEmbed) 
                })

              })
            });
          }

        })
        .catch((err)=>{
          msg.channel.send(`\`${err.message}\``);
          return console.error('Error executing query', err.stack);
        });

        msg.channel.stopTyping();

      }
  },


  /**
   * --------------------------------------------------------------------------------------------------------------------------------------------------------------
   * @name distortText(msg);
   * @param {String} msg 
   * @description : Distorts texts by changing letters' case by random. 
   *                Plans : Implement a feature that allows a user to distort a last message of the particular chat member.
   */
  distortText: function(client, msg){
    if((msg.content == "!mockme" || msg.content == "!mockme shutit") && msg.author.bot != true){
      msg.channel.startTyping();
      
      if(speakTimer(msg, 5000) == true){
        msg.channel.send("`Sorry, you cant be using me for the next " + getTimeLeft().toString() + "s !`");
        return;
      }

      var messageOrigin;

      msg.channel.fetchMessages({"limit" : 2})
        .then(messages => {
          messages.array().forEach( message => {
            messageOrigin = message.content;

            if(message.author.bot == true) return; 

            var response = ""; 
            
            if(message.content === (".mockme") || message.content === (".mockme shutit")) return; 

            for(i = 0; i < messageOrigin.length; i++){
              var chance = Math.floor(Math.random() * (2 - 1) + 1);
              
              if((Math.floor(Math.random() * 3) + 1) == 1){
                response += messageOrigin.charAt(i).toUpperCase();

                if((Math.floor(Math.random() * 20) + 1) == 4 && (messages.array()[0].content.includes("shutit"))){
                  message.reply(response + "-      shut up.");
                  return;
                }

              }else{
                response += messageOrigin.charAt(i).toLowerCase();
              }

            }

            if(!msg.member.hasPermission("MANAGE_MESSAGES")){
              return message.reply(response);
            } 

            //message.delete(500);
            message.reply(response);
              
          });
        });
    }

    msg.channel.stopTyping();

  }   
}