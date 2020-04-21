const Discord = require('discord.js');
const assist_func = require('./assist_functions'); 

module.exports = {
   /**
   * @name uwu_fier(...);
   * 
   * @param {String} msg 
   * @param {String} prefix
   * 
   * @description : uwu-fy any message
   * 
   */
  uwu_fier: function(prefix, msg){
    let uwu_user = new RegExp("^" + prefix + "uwu <@.?[0-9]+>$", "g");
    let uwu_sentence = new RegExp("^" + prefix + "uwu .*?");

    if(uwu_user.test(msg.content.toLowerCase())){
      let usr_id = msg.content.slice(msg.content.indexOf("<"), msg.content.length);
      
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  

      let response = ""; 
      let check = false;

      msg.channel.messages.fetch({"limit" : 100})
        .then(messages => {

          messages.array().forEach(message => {
            if(usr_id.includes(message.author.id) && (message.content != msg.content) && !check && message.content != ""){
              check = true;
              response = message.content.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww").replace("oo", "owo") + ". uwu";

              for(let i = 0; i < response.length; i++){
                response = response.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww").replace("oo", "owo");
              }

            }   
          });

          msg.channel.send(response);

        });
    }

    else if(uwu_sentence.test(msg.content.toLowerCase())){
      let uwuMessage = msg.content.slice(msg.content.indexOf(" "), msg.content.length);
      let msg_send = "";

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  

      msg_send = uwuMessage.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww").replace("oo", "owo") + ". uwu";

      for(let i = 0; i < uwuMessage.length; i++){
        msg_send = msg_send.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww").replace("oo", "owo");
      }     

      msg.channel.send(msg_send);

    }
  }
} 