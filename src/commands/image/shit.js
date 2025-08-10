const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'shit',
    aliases: ["shit"],
    description: 'Canvas command',
    usage: 'shit',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/plate_shit.png');
            const canvas = createCanvas(634, 775);
            const ctx = canvas.getContext('2d');
            ctx.fillRect(0, 0, 434, 675);
            ctx.drawImage(data, 0, 0, 634, 775);
            ctx.drawImage(convertImage, 200, 505, 169, 169);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'shit.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};