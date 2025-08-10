const { EmbedBuilder } = require('discord.js');
const mainFuncs = require('../../functions/mainFuncs');
module.exports = {
    name: 'reverse',
    aliases: ["reverse"],
    description: 'Reverses the text you provide.',
    usage: 'reverse <text>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const input = args.join(` `);
            if (!input) return mainFuncs.sendUsage(message, prefix, `reverse <text>`, `text`);
            const regx = /[^\x00-\x7F]/;
            if (regx.test(input.toLowerCase())) return mainFuncs.send(message, `***Can't reverse messages that contain ASCII characters.***`);
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setDescription(`desrever: ${input.split("").reverse().join(``).substring(0, 4095)}`)
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};