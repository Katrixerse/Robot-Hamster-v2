const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'bill',
    aliases: ["bill"],
    description: 'Canvas command',
    usage: 'bill',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            //const plate = await fs.readFileSync('./assets/images/plate_bill.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/plate_bill.png');
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext('2d');
            //ctx.fillStyle('#6B363E');
            ctx.drawImage(convertImage, 80, 0, 150, 150);
            ctx.drawImage(data, 0, 0, 325, 150);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'bill.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};