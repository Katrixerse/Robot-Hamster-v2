const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
const canvasFuncs = require('../../functions/canvasFuncs');
module.exports = {
    name: 'greyscale',
    aliases: ["greyscale"],
    description: 'Canvas command',
    usage: 'greyscale',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const data = await loadImage(user);
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0);
            canvasFuncs.greyscale(ctx, 0, 0, data.width, data.height);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'greyscale.png'
                }]
            });
        } catch (err) {
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};