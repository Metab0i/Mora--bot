const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const Jimp = require('jimp');
const fs = require('fs');


module.exports = {
  hug: async function(prefix, msg, client){
    let hug_regex = new RegExp("^" + prefix + "hug <@.?[0-9]+>");

    if(hug_regex.test(msg.content.toLowerCase())){
      //user timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();  

      let hug_image;
      let user_pfp;

      try{
        let user = await assist_func.id_to_user(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);
        hug_image = await Jimp.read('../Mora bot/misc/hug.jpg');
        user_pfp = await Jimp.read(user.avatarURL);
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }
      

      user_pfp.resize(240, 240);
      user_pfp.rotate(-10, false);

      hug_image.composite(user_pfp, 575, 150);
      hug_image.write('fin.png');

      msg.channel.stopTyping();  
      msg.channel.send("This is a test: ", {files: ["fin.png"]})
        .then((res) =>{
          fs.unlinkSync('fin.png')
        })
        .catch((err) =>{
          return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);                 
        })
    }
  },

  super_hot: async function(prefix, msg, client){
    let supahot_user = new RegExp("^" + prefix + "hot <@.?[0-9]+>$", "g");
    let supahot_sentence = new RegExp("^" + prefix + "hot .*?");

    if(supahot_user.test(msg.content.toLowerCase())){
      let usr_id = msg.content.slice(msg.content.indexOf(" "), msg.content.length).trim();
      let supaHot;
      let user_pfp;
      let font;
      let messages;

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      try{
        supaHot = await Jimp.read('../Mora bot/misc/too-hot.png');
        user_pfp = await Jimp.read(msg.author.avatarURL);
        messages = await msg.channel.fetchMessages({"limit" : 100})
        font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      let response = ""; 
      let check = false;
      
      messages.array().forEach(message => {
        if(usr_id.includes(message.author.id) && (message.content != msg.content) && !check && message.content != ""){
          check = true;
          response = message.content;
        }   
      });
      //every 43rd char insert \n
      //TODO: figure out the sizing and the scalin of the text
      let msgArray = response.match(/.{1,41}/g);
      let msgFinal = "";

      for(i = 0; i < msgArray.length; i++){
        msgFinal += msgArray[i] + " ";
      }

      supaHot.print(font, 30, 640, msgFinal, 380, 100)
      
      //supaHot.print(font, 40, 650, response);
      supaHot.write('supahot.png');

      msg.channel.stopTyping();  
      msg.channel.send({files: ["supahot.png"]})
        .then((res) =>{
          fs.unlinkSync('supahot.png')
        })
        .catch((err) =>{
          return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);                 
        })
    }

    else if(supahot_sentence.test(msg.content.toLowerCase())){
      let usr_id = msg.content.slice(msg.content.indexOf(" "), msg.content.length).trim();
      let supaHot;
      let user_pfp;
      let font;
      let messages;

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      try{
        supaHot = await Jimp.read('../Mora bot/misc/too-hot.png');
        user_pfp = await Jimp.read(msg.author.avatarURL);
        messages = await msg.channel.fetchMessages({"limit" : 100})
        font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }

      let supahotMessage = msg.content.slice(msg.content.indexOf(" "), msg.content.length);
      let msgArray = supahotMessage.match(/.{1,41}/g);
      let msgFinal = "";

      for(i = 0; i < msgArray.length; i++){
        msgFinal += msgArray[i] + " ";
      }

      supaHot.print(font, 30, 640, msgFinal, 380, 100)
      
      supaHot.write('supahot.png');

      msg.channel.stopTyping();  
      msg.channel.send({files: ["supahot.png"]})
        .then((res) =>{
          fs.unlinkSync('supahot.png')
        })
        .catch((err) =>{
          return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);                 
        })

    }
  }
}