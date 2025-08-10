const { EmbedBuilder } = require('discord.js');
const mainFuncs = require('../../functions/mainFuncs');

module.exports = {
    name: 'roll',
    aliases: ["roll"],
    description: 'Roll a dice.',
    usage: 'roll <sides>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const sides = args[0];
        if (!sides) return mainFuncs.sendUsage(message, prefix, `roll <sides>`, `sides`);
        try {
            const embed = new EmbedBuilder()
                .setTitle("Dice roll")
                .setTimestamp()
                .setThumbnail(bot.user.avatarURL())
                .setAuthor({ name: message.author.username })
                .setColor(`#F49A32`)
                .addFields([
                    { name: "Result", value: `${sides[Math.floor(Math.random() * sides.length)]}`, inline: true }
                ]);
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};