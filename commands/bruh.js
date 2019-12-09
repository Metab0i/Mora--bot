const assist_func = require('./assist_functions');
const ffmpeg = require('ffmpeg');

module.exports = {
  //https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_manipulation#Audio_manipulation
  //https://www.youtube.com/watch?reload=9&v=xmGv_Schm5U
  bruh_pitched: async function(prefix, msg){
    let bruh_check = new RegExp("^" + prefix + "bruh$"); 

    if(bruh_check.test(msg.content.toLowerCase())){
      if(assist_func.userTimeOut(msg) == true) return;

      const voiceChannel = msg.member.voiceChannel; 

      if(voiceChannel != null){
        const connection = await voiceChannel.join()
        let dispatcher = null

        switch (assist_func.random_number(0, 4)) {
          case 0:
            dispatcher = connection.playFile("../Mora bot/misc/original_bruh.mp3")
            break;
          case 1:
            dispatcher = connection.playFile("../Mora bot/misc/autobruh.mp3")
            break;
          case 2:
            dispatcher = connection.playFile("../Mora bot/misc/bruh hhHhHhhh.mp3")
            break;
          case 3:
            dispatcher = connection.playFile("../Mora bot/misc/BRUH.mp3")
            break;
          case 4:
            dispatcher = connection.playFile("../Mora bot/misc/hurB.mp3")
            break;
        }
        
        dispatcher.on("end", end => {
          setTimeout(function(){
            voiceChannel.leave();
          }, 1000);
          
        })

        
      }
      else{
        switch (assist_func.random_number(0, 4)) {
          case 0:
            msg.channel.send({files: ["../Mora bot/misc/original_bruh.mp3"]})
            
            break;
          case 1:
            msg.channel.send({files: ["../Mora bot/misc/autobruh.mp3"]})
            
            break;
          case 2:
            msg.channel.send({files: ["../Mora bot/misc/bruh hhHhHhhh.mp3"]})

            break;
          case 3:
            msg.channel.send({files: ["../Mora bot/misc/BRUH.mp3"]})

            break;
          case 4:
            msg.channel.send({files: ["../Mora bot/misc/hurB.mp3"]})

            break;
        }
      }
    }
  }
}