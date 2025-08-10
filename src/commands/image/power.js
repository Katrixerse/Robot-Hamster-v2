const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'power',
    aliases: ["power"],
    description: 'Canvas command',
    usage: 'power',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/i-have-the-power.png');
            const canvas = createCanvas(720, 536);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0, 720, 536);
            ctx.drawImage(convertImage, 345, 23, 169, 169);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'i-have-the-power.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};