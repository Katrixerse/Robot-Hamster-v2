const { createCanvas, loadImage } = require('canvas');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: 'banned',
    aliases: ["banned"],
    description: 'Canvas command',
    usage: 'banned',
    cooldownTime: '1',
    group: 'image',
    botPermissions: [PermissionFlagsBits.AttachFiles],
    run: async (bot, prefix, message, args, con) => {
        if (message.mentions.users.size < 1) return message.channel.send("No mentions found in your message.");
        try {
            const user = message.mentions.users.first().avatarURL().replace('.gif', '.png').replace('.webp', '.png');
            //const plate = await fs.readFileSync('./assets/images/plate_bill.png');
            const convertImage = await loadImage(user);
            const data = await loadImage('./src/assets/images/banned.png');
            const canvas = createCanvas(1851, 1828);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(convertImage, 0, 0, 1851, 1828);
            ctx.drawImage(data, 0, 0, 1851, 1828);
            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'banned.png'
                }]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }
};