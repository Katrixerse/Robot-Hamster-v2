const { EmbedBuilder } = require('discord.js');

const options = [
    "Heads",
    'Tails'
];

module.exports = {
    name: 'coinflip',
    aliases: ["coinflip"],
    description: 'Flips a coin.',
    usage: 'coinflip',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const embed = new EmbedBuilder()
                .setTitle("Coin Flip")
                .setTimestamp()
                .setThumbnail(bot.user.avatarURL())
                .setAuthor({ name: message.author.username })
                .setColor(`#F49A32`)
                .addFields([
                    { name: "Result", value: `${options[Math.floor(Math.random() * options.length)]}`, inline: true }
                ]);
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};