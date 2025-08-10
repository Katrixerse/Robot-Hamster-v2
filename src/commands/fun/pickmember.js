const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'pickmember',
    aliases: ["pm"],
    description: 'Picks a random member.',
    usage: 'pickmember @User',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const em = new EmbedBuilder()
                .setDescription(`**Member picked:** ${message.guild.members.cache.random()}`)
                .setColor(`#F49A32`);
            message.channel.send({ embeds: [em] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};