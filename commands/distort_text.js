const Discord = require('discord.js');
const assist_func = require('./assist_functions'); 

module.exports = {
   /**
   * @name distortText(msg);
   * 
   * @param {String} msg 
   * @param {String} prefix
   * 
   * @description : dIsTorT anY tExT
   */
  distortText: function(prefix, msg){
    if(msg.author.bot == true) return;

    let disText_user = new RegExp("^" + prefix + "distext <@.?[0-9]+>$", "g");
    let disText_any = new RegExp("^" + prefix + "distext .*?");

    if(disText_user.test(msg.content.toLowerCase())){
      let usr_id = msg.content.slice(msg.content.indexOf("<"), msg.content.length);
      
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      let response = ""; 
      let check = false;

      msg.channel.messages.fetch({"limit" : 100})
        .then(messages => {

          messages.array().forEach(message => {
            if(usr_id.includes(message.author.id) && (message.content != msg.content) && !check && message.content != ""){
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
      let disMessage = msg.content.slice(msg.content.indexOf(" "), msg.content.length);
      let msg_send = "";

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