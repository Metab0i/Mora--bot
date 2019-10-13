const assist_func = require('./assist_functions');
const Jimp = require('jimp');
const fs = require('fs');
const { BitmapImage, GifUtil, GifFrame } = require('gifwrap');

module.exports = {

  /**
   * @name muda(...)
   * 
   * @param {String} prefix 
   * @param {String} msg 
   * @param {Discord.Client} client 
   * 
   * @description : An animated gif of a mentioned user's profile picture getting ora'ed. Uses an external library gifwrap. 
   *                A process involves editing an already existing gif frame by frame.
   * 
   * @url : https://github.com/jtlapp/gifwrap
   */
  ora: async function(prefix, msg, client){
    let muda_regex = new RegExp("^" + prefix + "ora <@.?[0-9]+>");

    if(muda_regex.test(msg.content.toLowerCase())){
      //user timer
      if(assist_func.userTimeOut(msg) == true) return;
      msg.channel.send("`it's gonna take a few seconds |`")
        .then(async message => {
          msg.channel.startTyping();

          const frames_mod = [];
          let user;

          try{
            user = await assist_func.id_to_user(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
          }catch(err){
            return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
          }

          message.edit("`it's gonna take a few seconds /`")

          GifUtil.read("../Mora bot/misc/ora.gif").then(async inputGif => {

            message.edit("`it's gonna take a few seconds --`")

            for(i = 0; i < inputGif.frames.length; i++) {
              let frame_edit = GifUtil.shareAsJimp(Jimp, inputGif.frames[i]);
              let canvas_mod = await Jimp.read('../Mora bot/misc/canvas_wide.png');
              let user_pfp = await Jimp.read(user.avatarURL);
              let frame_final;
              

              //adjust user pfp image
              user_pfp.resize(100, 100);
              user_pfp.rotate(5, true);

              switch(i){
                case 0:
                  user_pfp.fade(1);
                  canvas_mod.composite(user_pfp, 280, 30);
                  break;
                case 1:
                  for(k = 0; k < 6; k++ ) user_pfp.fade(0.8);
                  canvas_mod.composite(user_pfp, 280, 30);
                  break;
                case 2:
                  for(k = 0; k < 6; k++ ) user_pfp.fade(0.4);
                  canvas_mod.composite(user_pfp, 280, 30);
                  break;
                case 39:
                  user_pfp.fade(0.9);
                  canvas_mod.composite(user_pfp, 280, 30);
                  break;
                case 40:
                  for(k = 0; k < 7; k++ ) user_pfp.fade(0.8);
                  canvas_mod.composite(user_pfp, 280, 30);
                  break;
                case 41:
                  for(k = 0; k < 10; k++ ) user_pfp.fade(0.9);
                  canvas_mod.composite(user_pfp, 280, 30);
                  break;
                case 42:
                  user_pfp.fade(1);
                  canvas_mod.composite(user_pfp, 280, 30);
                  break;
                default:
                  user_pfp.fade(0);
                  canvas_mod.composite(user_pfp, (Math.random() * (280 - 270) + 270), (Math.random() * (30 - 25) + 25));
                  break;
              }

              frame_edit.resize(400, 200);
              canvas_mod.composite(frame_edit, 0, 0);
              
              frame_final = new GifFrame(canvas_mod.bitmap)
              frames_mod.push(frame_final);

            }

            message.edit("`it's gonna take a few seconds \\`")

            GifUtil.quantizeSorokin(frames_mod, 256);

            message.edit("`it's gonna take a few seconds |`")

            GifUtil.write("ora_fin.gif", frames_mod, {loop: 0}).then(function() {
              msg.channel.stopTyping();
              message.edit("`it's gonna take a few seconds ✓`")
              message.delete(300);
              msg.channel.send("",{files: ["ora_fin.gif"]})
                .then((res) =>{ 
                  fs.unlinkSync('ora_fin.gif')
                })
                .catch((err) =>{
                  return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);                 
                })
            });
          })
        })
      
    }
  }
}