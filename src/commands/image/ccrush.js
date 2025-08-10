const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'ccrush',
    aliases: ["ccrush"],
    description: 'Canvas command',
    usage: 'crush',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const user2 = message.author.avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const convertImage2 = await loadImage(user2);
            const data = await loadImage('./src/assets/images/plate_crush.png');
            const canvas = createCanvas(600, 873);
            const ctx = canvas.getContext('2d');
            ctx.rotate(-0.09);
            ctx.drawImage(convertImage, 109, 454, 417, 417);
            ctx.resetTransform();
            ctx.drawImage(data, 0, 0, 600, 873);
            ctx.drawImage(convertImage2, 407, 44, 131, 131);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'plate_crush.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};