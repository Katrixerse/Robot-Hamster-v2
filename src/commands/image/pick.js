const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'pick',
    aliases: ["pick"],
    description: 'Canvas command',
    usage: 'pick',
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
            const data = await loadImage('./src/assets/images/drakeposting.png');
            const canvas = createCanvas(1024, 1024);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0, 1024, 1024);
            ctx.drawImage(convertImage, 512, 0, 512, 512);
            ctx.drawImage(convertImage2, 512, 512, 512, 512);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'drakeposting.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};