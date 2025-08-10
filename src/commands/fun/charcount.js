const { EmbedBuilder } = require('discord.js');
const mainFuncs = require('../../functions/mainFuncs');
module.exports = {
    name: 'charcount',
    aliases: ["charcount"],
    description: 'Gives you a character count.',
    usage: 'charcount <text>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const chars = args.join(` `);
            if (!chars) return mainFuncs.sendUsage(message, prefix, `charcount <text>`, 'text');
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .addFields([
                    { name: `Text`, value: `${chars.substring(0, 2048)}` },
                    { name: `Characters`, value: `${chars.length}`, inline: true }
                ])
                .setTimestamp()
                .setThumbnail(bot.user.avatarURL());
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};