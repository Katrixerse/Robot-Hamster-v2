const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
  name: 'jail',
  aliases: ["jail"],
  description: 'Canvas command',
  usage: 'jail',
  cooldownTime: '1',
  group: 'image',
  botPermissions: [PermissionFlagsBits.AttachFiles],
  run: async (bot, prefix, message, args, con) => {
    if (message.mentions.users.size < 1) return message.channel.send("You didn't mention a user to jail.");
    try {
      const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
      const convertImage = await loadImage(user);
      const data = await loadImage('./src/assets/images/jail.png');
      const canvas = createCanvas(420, 420);
      const ctx = canvas.getContext('2d');
      ctx.fillRect(0, 0, 634, 675);
      ctx.drawImage(convertImage, 0, 0, 420, 420);
      ctx.drawImage(data, 0, 0, 420, 420);
      const attachment = canvas.toBuffer();
      return message.channel.send({
        files: [{
          attachment,
          name: 'jail.png'
        }]
      });
    } catch (err) {
      console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
      return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
};