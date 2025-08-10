const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'tattoo',
    aliases: ["tattoo"],
    description: 'Canvas command',
    usage: 'tattoo',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/the-ultimate-tattoo.png');
            const canvas = createCanvas(750, 1089);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0, 750, 1089);
            ctx.drawImage(convertImage, 200, 645, 320, 320);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'the-ultimate-tattoo.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};