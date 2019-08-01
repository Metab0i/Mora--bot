const Discord = require('discord.js');
const assist_func = require('./assist_functions'); 

module.exports = {
   /**
   * @name distortText(msg);
   * @param {String} msg 
   * @description : Distorts texts by changing letters' case by random. 
   *                Plans : Implement a feature that allows a user to distort a last message of the particular chat member.
   */
  distortText: function(prefix, msg){
    if(msg.author.bot == true) return;

    var disText_check = new RegExp("^" + prefix + "distext <@.?[0-9]+>$", "g");
    var disText_any = new RegExp("^" + prefix + "distext .*?");

    if(disText_check.test(msg.content.toLowerCase())){
      var usr_id = msg.content.slice(msg.content.indexOf("<"), msg.content.length);
      
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      var response = ""; 
      var check = false;

      msg.channel.fetchMessages({"limit" : 100})
        .then(messages => {

          messages.array().forEach(message => {
            if(usr_id.includes(message.author.id) && (message.content != msg.content) && !check){
              check = true;

              for(i = 0; i < message.content.length; i++){                
                if((Math.floor(Math.random() * 3) + 1) == 1){                  
                  response += message.content.charAt(i).toUpperCase();
                }else{
                  response += message.content.charAt(i).toLowerCase();
                }
              }
            }   
          });

          msg.channel.stopTyping();
          msg.channel.send(response);

        });
    }

    else if(disText_any.test(msg.content.toLowerCase())){
      var disMessage = msg.content.slice(msg.content.indexOf(" "), msg.content.length);
      var msg_send = "";

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      for(i = 0; i < disMessage.length; i++){                
        if((Math.floor(Math.random() * 3) + 1) == 1){                  
          msg_send += disMessage.charAt(i).toUpperCase();
        }else{
          msg_send += disMessage.charAt(i).toLowerCase();
        }
      }

      msg.channel.stopTyping();
      msg.channel.send(msg_send);

    }
  }
} 