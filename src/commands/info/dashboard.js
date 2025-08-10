const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'dashboard',
    aliases: ["dash"],
    description: 'Sends a link to the dashboard',
    usage: 'botinfo',
    cooldownTime: '1',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .addFields([
                { name: '**__Link:__**', value: `[Dashboard](https://www.robothamster.ca/)` }
            ]);
        message.channel.send({ embeds: [embed] });
    }
};