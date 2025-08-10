const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'look',
    aliases: ["look"],
    description: 'Canvas command',
    usage: 'look',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/look-what-karen-have.png');
            const canvas = createCanvas(768, 432);
            const ctx = canvas.getContext('2d');
            ctx.rotate(-6.5 * (Math.PI / 180));
            ctx.drawImage(convertImage, 514, 50, 512, 512);
            ctx.rotate(6.5 * (Math.PI / 180));
            ctx.drawImage(data, 0, 0, 768, 432);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'look-what-karen-have.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};