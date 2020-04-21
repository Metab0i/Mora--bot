const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const Jimp = require('jimp');
const fs = require('fs');


module.exports = {
  /**
   * @name hug(...)
   * 
   * @param {String} msg 
   * @param {String} prefix
   * 
   * @description : hugs a mentioned user's profile picture
   * 
   */
  hug: async function(prefix, msg, client){
    let hug_regex = new RegExp("^" + prefix + "hug <@.?[0-9]+> ?2?$");

    if(hug_regex.test(msg.content.toLowerCase())){
      //user timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();  

      let hug_image;
      let user_pfp;
      let canvas;

      try{
        let user = await assist_func.id_to_user(msg.content.slice(msg.content.indexOf("<"), msg.content.indexOf(">") + 1), client, msg);

        hug_image = msg.content.slice(msg.content.indexOf(">") + 1).includes("2") ? await Jimp.read('../Mora bot/misc/anime-hug.png') : await Jimp.read('../Mora bot/misc/anime-hug2.png');
        canvas = await Jimp.read('../Mora bot/misc/canvas.png');

        user_pfp = await Jimp.read(user.avatarURL({format: "png"}));
      }catch(err){
        return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);         
      }
      
      if(msg.content.slice(msg.content.indexOf(">") + 1).includes("2")){
        user_pfp.resize(300, 300);

        hug_image.resize(500, 500);

        canvas.composite(user_pfp, 100, 170);
        canvas.composite(hug_image, 0, 0);
      }
      else{
        user_pfp.resize(230, 230);
        user_pfp.rotate(-20, false);

        hug_image.resize(500, 500);

        canvas.composite(user_pfp, 240, 250);
        canvas.composite(hug_image, 0, 0);
      }      

      msg.channel.stopTyping();  
      msg.channel.send({files: [await canvas.getBufferAsync(Jimp.MIME_PNG)]});
      
    }
  },

  /**
   * @name super_hot(...)
   * 
   * @param {*} prefix 
   * @param {*} msg 
   * @param {*} client 
   * 
   * @description : puts a text of a message into a last frame. (text going out of text box was done for comedic purposes)
   */
  super_hot: async function(prefix, msg, client){
    let supahot_user = new RegExp("^" + prefix + "hot <@.?[0-9]+>$", "g");
    let supahot_sentence = new RegExp("^" + prefix + "hot .*?");

    if(supahot_user.test(msg.content.toLowerCase())){
      let usr_id = msg.content.slice(msg.content.indexOf(" "), msg.content.length).trim();
      let supaHot;
      let font;
      let messages;

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      try{
        supaHot = await Jimp.read('../Mora bot/misc/too-hot.png');
        user_pfp = await Jimp.read(msg.author.avatarURL({format: "png"}));
        messages = await msg.channel.messages.fetch({"limit" : 100})
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

      let msgArray = response.match(/.{1,41}/g);
      let msgFinal = "";

      for(i = 0; i < msgArray.length; i++){
        msgFinal += msgArray[i] + " ";
      }

      supaHot.print(font, 30, 640, msgFinal, 380, 100)

      msg.channel.stopTyping();  
      msg.channel.send({files: [await supaHot.getBufferAsync(Jimp.MIME_PNG)]})
    }

    else if(supahot_sentence.test(msg.content.toLowerCase())){
      let supaHot;
      let font;
      //User timer
      if(assist_func.userTimeOut(msg) == true) return;  
      msg.channel.startTyping();

      try{
        supaHot = await Jimp.read('../Mora bot/misc/too-hot.png');
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

      msg.channel.stopTyping();  
      msg.channel.send({files: [await supaHot.getBufferAsync(Jimp.MIME_PNG)]});

    }
  }
}