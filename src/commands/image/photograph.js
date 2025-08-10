const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'photograph',
    aliases: ["photograph"],
    description: 'Canvas command',
    usage: 'photograph',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/look-at-this-photograph.png');
            const canvas = createCanvas(620, 349);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0, 620, 349);
            ctx.rotate(-13.5 * (Math.PI / 180));
            ctx.drawImage(convertImage, 280, 218, 175, 125);
            const attachment = canvas.toBuffer();
            return message.channel.send({
              files: [{
                attachment,
                name: 'photograph.png'
              }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};