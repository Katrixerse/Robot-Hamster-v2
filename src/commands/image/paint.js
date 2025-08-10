const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
  name: 'paint',
  aliases: ["paint"],
  description: 'Canvas command',
  usage: 'paint',
  cooldownTime: '1',
  group: 'image',
  botPermissions: [PermissionFlagsBits.AttachFiles],
  run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/bob-ross.png');
            const canvas = createCanvas(600, 755);
            const ctx = canvas.getContext('2d');
            ctx.rotate(3 * (Math.PI / 180));
            ctx.drawImage(convertImage, 30, 19, 430, 430);
            ctx.rotate(-3 * (Math.PI / 180));
            ctx.drawImage(data, 0, 0, 600, 755);
            const attachment = canvas.toBuffer();
            return message.channel.send({
              files: [{
                attachment,
                name: 'paint.png'
              }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};