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
      const file_names = ["original_bruh", "autobruh", "bruh hhHhHhhh", "BRUH", "hurB", "2bruh", "breh", "bruhbrubru", "bruhwhat", "bruuuuuuuuuuuuuuuuh", "demon_bruh", "glitch_bruh", "hurbhurbhurb", "kinda_long_bruh", "long_bruh", "nightmare_bruh", "really_long_bruh"];

      if(voiceChannel != null){
        const connection = await voiceChannel.join()

        let dispatcher = connection.playFile("../Mora bot/misc/bruh_sounds/" + file_names[assist_func.random_number(0, file_names.length)] + ".mp3");
        
        switch(assist_func.random_number(0, 1)){
          case 0:
            await msg.react('🇧');
            await msg.react('🇷');
            await msg.react('🇺');
            await msg.react('🇭');

            break;
        }

        dispatcher.on("end", end => {
          setTimeout(function(){
            voiceChannel.leave();
          }, 1000);
          
        })
      }

      else{
        msg.channel.startTyping();

        msg.channel.send({files: ["../Mora bot/misc/bruh_sounds/" + file_names[assist_func.random_number(0, file_names.length)] + ".mp3"]});
      }

      msg.channel.stopTyping();

    }
  }
}