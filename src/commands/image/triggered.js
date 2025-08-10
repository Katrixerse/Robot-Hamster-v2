const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
  name: 'triggered',
  aliases: ["triggered"],
  description: 'Canvas command',
  usage: 'triggered',
  cooldownTime: '1',
  group: 'image',
  botPermissions: [PermissionFlagsBits.AttachFiles],
  run: async (bot, prefix, message, args, con) => {
    if (message.mentions.users.size < 1) return message.channel.send("You didn't mention a user to trigger.");
    try {
      const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
      const convertImage = await loadImage(user);
      const data = await loadImage('./src/assets/images/triggered.png');
      const canvas = createCanvas(480, 480);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(convertImage, 0, 0, 480, 480);
      ctx.drawImage(data, 0, 150, 480, 480);
      const attachment = canvas.toBuffer();
      return message.channel.send({
        files: [{
          attachment,
          name: 'triggered.png'
        }]
      });
    } catch (err) {
      console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
      return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
};