const assist_func = require('./assist_functions');
const Jimp = require('jimp');
const {GifCodec, GifUtil, GifFrame, Gif } = require('gifwrap');

module.exports = {

  /**
   * @name stomp(...)
   * 
   * @param {String} prefix 
   * @param {String} msg 
   * @param {Discord.Client} client 
   * 
   * @description : An animated gif of a mentioned user's profile picture getting stomped. Uses an external library gifwrap. 
   *                A process involves editing an already existing gif frame by frame.
   * 
   * @url : https://github.com/jtlapp/gifwrap
   */
  stomp: async function(prefix, msg, client){
    let stomp_regex = new RegExp("^" + prefix + "stomp <@.?[0-9]+>");

    if(stomp_regex.test(msg.content.toLowerCase())){
      //user timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();  

      let user_pfp;

      

      try{
        let user = await assist_func.id_to_user(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
        user_pfp = await Jimp.read(user.avatarURL({format: "png"}));
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      //adjust user pfp image
      user_pfp.resize(180, 180);
      user_pfp.rotate(-10, true);

      GifUtil.read("../Mora bot/misc/Anime-girl-stomps.gif").then(inputGif => {
        let count = 0

        inputGif.frames.forEach(frame => {
          let frame_edit = GifUtil.shareAsJimp(Jimp, frame);

          switch(count){
            case 0:
              frame_edit.composite(user_pfp, -20, 570);
              break;
            case 1:
              frame_edit.composite(user_pfp, -15, 490);
              break;
            case 2:
              frame_edit.composite(user_pfp, -10, 480);
              break;
            case 3:
              frame_edit.composite(user_pfp, -5, 450);
              break;
            case 4:
              frame_edit.composite(user_pfp, -20, 570);
              break;
            case 5:
              frame_edit.composite(user_pfp, -20, 575);
              break;
            default:
              break;
          }

          count++;
          frame = new GifFrame(frame_edit.bitmap);

          GifUtil.quantizeSorokin(frame, 256);
        });
      
        const codec = new GifCodec()
      
        codec.encodeGif(inputGif.frames, {loops: 0}).then(async outputGif => {

          msg.channel.stopTyping();  
          msg.channel.send({files: [{
            attachment: outputGif.buffer,
            name: 'file.gif'
          }]})
            .catch((err) =>{
              return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);                 
            })
        });
      })
    }
  }
}