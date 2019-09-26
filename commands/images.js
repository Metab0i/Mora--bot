const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const Jimp = require('jimp');
const fs = require('fs');


module.exports = {
  hug: async function(prefix, msg, client){
    var hug_regex = new RegExp("^" + prefix + "hug <@.?[0-9]+>");

    if(hug_regex.test(msg.content.toLowerCase())){
      //user timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();  

      try{
        var user = await assist_func.id_to_user(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
        var hug_image = await Jimp.read('../Mora bot/misc/hug.jpg');
        var user_pfp = await Jimp.read(user.avatarURL);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }
      

      user_pfp.resize(240, 240);
      user_pfp.rotate(-10, false);

      hug_image.composite(user_pfp, 575, 150);
      hug_image.write('fin.png');

      msg.channel.stopTyping();  
      msg.channel.send("This is a test: ", {files: ["fin.png"]});
      
    }

  }
}