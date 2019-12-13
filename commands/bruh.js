const assist_func = require('./assist_functions');
const ffmpeg = require('ffmpeg');

module.exports = {
  bruh_pitched: async function(prefix, msg){
    let bruh_check = new RegExp("^" + prefix + "bruh$"); 

    if(bruh_check.test(msg.content.toLowerCase())){

      if(assist_func.userTimeOut(msg) == true) return;

      const voiceChannel = msg.member.voiceChannel; 
      const file_names = ["original_bruh", "autobruh", "bruh hhHhHhhh", "BRUH", "hurB", "2bruh", "breh", "bruhbrubru", "bruhwhat", "bruuuuuuuuuuuuuuuuh", "demon_bruh", "glitch_bruh", "hurbhurbhurb", "kinda_long_bruh", "long_bruh", "nightmare_bruh", "really_long_bruh"];

      if(voiceChannel != null){
        const connection = await voiceChannel.join()

        let dispatcher = connection.playFile("../Mora bot/misc/bruh_sounds/" + file_names[assist_func.random_number(0, file_names.length-1)] + ".mp3");

        dispatcher.on("end", end => {
          voiceChannel.leave();
        })
      }

      else{
        msg.channel.startTyping();

        msg.channel.send({files: ["../Mora bot/misc/bruh_sounds/" + file_names[assist_func.random_number(0, file_names.length-1)] + ".mp3"]});
      }

      msg.channel.stopTyping();

    }
  }
}