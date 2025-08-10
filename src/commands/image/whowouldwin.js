const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'whowouldwin',
    aliases: ["whowouldwin"],
    description: 'Canvas command',
    usage: 'whowouldwin',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("You didn't mention a user.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const user2 = message.author.avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const convertImage2 = await loadImage(user2);
            const data = await loadImage('./src/assets/images/Who-Would-Win.png');
            const canvas = createCanvas(802, 500);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0, 802, 500);
            ctx.drawImage(convertImage, 41, 124, 318, 325);
            ctx.drawImage(convertImage2, 461, 124, 318, 325);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'Who-Would-Win.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};