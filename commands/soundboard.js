const assist_func = require('./assist_functions');
const ffmpeg = require('ffmpeg');

module.exports = {
  /**
   * @name soundboard(...)
   * 
   * @description : play or post either oof or bruh sound depending on whether the command user is in a vc or not
   * @param {String} prefix 
   * @param {MESSAGE} msg 
   */
  soundboard: async function(prefix, msg){
    let bruh_check = new RegExp("^" + prefix + "bruh$"); 
    let oof_check = new RegExp("^" + prefix + "oof$");

    if(bruh_check.test(msg.content.toLowerCase()) || oof_check.test(msg.content.toLowerCase())){

      if(assist_func.userTimeOut(msg) == true) return;

      const voiceChannel = msg.member.voice.channel; 
      let file_names = [];
      
      if(bruh_check.test(msg.content.toLowerCase())) file_names = ["original_bruh", "autobruh", "bruh hhHhHhhh", "BRUH", "hurB", "2bruh", "breh", "bruhbrubru", "bruhwhat", "bruuuuuuuuuuuuuuuuh", "demon_bruh", "glitch_bruh", "hurbhurbhurb", "kinda_long_bruh", "long_bruh", "nightmare_bruh", "really_long_bruh"];
      if(oof_check.test(msg.content.toLowerCase())) file_names = ["oof", "oof2", "oof3", "oof666", "oof66", "oof6"];

      if(voiceChannel != null){
        const connection = await voiceChannel.join();

        let dispatcher = connection.play("../Mora bot/misc/sounds/" + file_names[assist_func.random_number(0, file_names.length-1)] + ".mp3");

        dispatcher.on("finish", end => {
          voiceChannel.leave();
        })
      }

      else{
        msg.channel.startTyping();

        msg.channel.send({files: ["../Mora bot/misc/sounds/" + file_names[assist_func.random_number(0, file_names.length-1)] + ".mp3"]});
      }

      msg.channel.stopTyping();

    }
  }
}