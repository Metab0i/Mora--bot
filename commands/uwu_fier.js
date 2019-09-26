const Discord = require('discord.js');
const assist_func = require('./assist_functions'); 

module.exports = {
   /**
   * @name uwu_fier(...);
   * 
   * @param {String} msg 
   * 
   * @description : uwu-fy any message
   * 
   */
  uwu_fier: function(prefix, msg){
    var uwu_user = new RegExp("^" + prefix + "uwu <@.?[0-9]+>$", "g");
    var uwu_sentence = new RegExp("^" + prefix + "uwu .*?");

    if(uwu_user.test(msg.content.toLowerCase())){
      var usr_id = msg.content.slice(msg.content.indexOf("<"), msg.content.length);
      
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      var response = ""; 
      var check = false;

      msg.channel.fetchMessages({"limit" : 100})
        .then(messages => {

          messages.array().forEach(message => {
            if(usr_id.includes(message.author.id) && (message.content != msg.content) && !check && message.content != ""){
              check = true;
              response = message.content.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww") + ". uwu";

              for(i = 0; i < response.length; i++){
                response = response.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww");
              }

            }   
          });

          msg.channel.stopTyping();
          msg.channel.send(response);

        });
    }

    else if(uwu_sentence.test(msg.content.toLowerCase())){
      var uwuMessage = msg.content.slice(msg.content.indexOf(" "), msg.content.length);
      var msg_send = "";

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      msg_send = uwuMessage.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww") + ". uwu";

      for(i = 0; i < uwuMessage.length; i++){
        msg_send = msg_send.toLowerCase().replace("r", "w").replace("l","w").replace("s", "th").replace("oh", "oww");
      }     

      msg.channel.stopTyping();
      msg.channel.send(msg_send);

    }
  }
} 