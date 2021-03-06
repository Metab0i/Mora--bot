const Discord = require('discord.js');
const assist_func = require('./assist_functions');
const Jimp = require('jimp');
const fs = require('fs');


module.exports = {

  /**
   * @name ascii_img(...)
   * 
   * @description : turn any image into ascii text art by grayscaling the image, iterating over every pixel 
   *                and based on the pixel contrast proceed to add an ascii character to the string
   * 
   * @param {String} prefix 
   * @param {String} msg 
   */
  ascii_image: async function(prefix, msg){
    const asciimg = new RegExp("^" + prefix + "asciimg.*?");;

    if(asciimg.test(msg.content.toLowerCase())){

      //User timer
      if(assist_func.userTimeOut(msg) == true) return;

      //0.253 - brightest; 0 - darkest; every 25.3 is a symbol
      const contrast_symbol = {
        "0 25.3" : "▓",
        "25.4 50.6" : "▒",
        "50.7 75.9" : "░",
        "76.0 101.2" : "#",
        "101.3 126.5" : "0",
        "126.6 151.8" : "1",
        "151.9 177.1" : "*",
        "177.2 202.4" : ";",
        "202.5 227.7" : ".",
        "227.8 255" : " "
      }

      //populate media array with media
      let media_array = [];

      //to give embeds and media attached to messages load prior to using them
      await new Promise(r => setTimeout(r, 2000));

      if(msg.attachments.size > 0){
        msg.attachments.forEach(function(value,key){
            const media_check = assist_func.content_type(String(value.url));
            
            if(media_check == "media") media_array.push(value.url);
        });
      }
      
      if(msg.embeds.length > 0){
        msg.embeds.forEach(function(value){
          const media_check = assist_func.content_type(String(value.url));

          if(media_check == "media") media_array.push(value.url);
        })
      }

      if(media_array.length == 0){
        return msg.channel.send("`Need an image for this command to work`");
      }

      msg.channel.startTyping();

      while(media_array.length > 0){
        const image = await Jimp.read(media_array.pop());
        let ascii_img = ""
        let ascii_mini = ""

        //grayscale and resize image
        image.grayscale();
        image.resize(400, 200);

        for(let y = 0; y < image.bitmap.height; y+= 1){
          let avg_contrast_mini = [];

          for(let x = 0; x < image.bitmap.width; x+= 1){
            const pixel_rgba = Jimp.intToRGBA(image.getPixelColor(x, y))
            const contrast_value = (0.299*pixel_rgba.r + 0.587*pixel_rgba.g + 0.114*pixel_rgba.b).toFixed(1);
            avg_contrast_mini.push(contrast_value);

            for(var range in contrast_symbol){
              const range_comparison = range.split(" ");
              if(contrast_value >= parseFloat(range_comparison[0]) && contrast_value <= parseFloat(range_comparison[1])){
                ascii_img += contrast_symbol[range];
              }
            }

            if(x % 6 == 0 && y % 7 == 0){
              let avg_cont_fin = 0.0;

              avg_contrast_mini.forEach(numb => {
                avg_cont_fin = Number(avg_cont_fin) + Number(numb);
              })

              avg_cont_fin = (avg_cont_fin / avg_contrast_mini.length).toFixed(1);

              avg_contrast_mini = [];

              for(var range_mini in contrast_symbol){
                const range_comparison = range_mini.split(" ");
                if(avg_cont_fin >= parseFloat(range_comparison[0]) && avg_cont_fin <= parseFloat(range_comparison[1])){
                  ascii_mini += contrast_symbol[range_mini];
                }
              }
            }
          }
          ascii_img += "\n"

          if(y % 7 == 0) {
            ascii_mini += "\n"
          }
        }

        //html version
        const html_buff = new Buffer.alloc(ascii_img.length);
        html_buff.fill(`<code><span style="display:block;line-height:8px; font-size: 8px; font-weight:bold;white-space:pre;font-family: monospace;color: black; background: white;\">${ascii_img}</span></code>`);

        //giving operation extra 2s to insure no hiccups occur
        await new Promise(r => setTimeout(r, 2000));

        msg.channel.send("`full scale ascii`:", {files: [{
          attachment: html_buff,
          name: 'file.html'
        }]})
          .catch((err) =>{
            return console.error('on [' + msg.content + ']\nBy <@' + msg.author.id + ">", err.stack);                 
          })

        msg.channel.send("`Phone users - landscape mode to view ascii art properly.`")
        msg.channel.send("`ascii mini:` \n```\n"+ascii_mini+"```");

      }

      msg.channel.stopTyping();

    }
  }
}
