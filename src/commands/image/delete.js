const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'delete',
    aliases: ["delete"],
    description: 'Canvas command',
    usage: 'delete',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/plate_delete.png');
            const canvas = createCanvas(550, 275);
            const ctx = canvas.getContext('2d');
            ctx.fillRect(0, 0, 634, 675);
            ctx.drawImage(data, 0, 0, 550, 275);
            ctx.drawImage(convertImage, 92, 106, 139, 151);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'plate_delete.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};