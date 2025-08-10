const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'byemom',
    aliases: ["byemom"],
    description: 'Canvas command',
    usage: 'byemom',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        const user_input = args.slice(1).join(' ');
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/bye-mom.png');
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext('2d');
            //ctx.fillStyle('#6B363E');
            ctx.drawImage(data, 0, 0, 680, 632);
            ctx.rotate(-25.5 * (Math.PI / 180));
            ctx.font = '26px Impact';
            ctx.fillText(`${user_input}`, 62, 708);
            ctx.rotate(25.5 * (Math.PI / 180));
            ctx.drawImage(convertImage, 84, 327, 169, 169);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'bye-mom.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};