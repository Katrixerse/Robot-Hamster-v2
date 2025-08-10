const { EmbedBuilder } = require("discord.js");
const { botVersion } = require('../../../config.json');
module.exports = {
    name: 'commandcount',
    aliases: ["bt"],
    description: 'Sends info on the bot',
    usage: 'botinfo',
    cooldownTime: '1',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .addFields([
                { name: '**__Commands:__**', value: `${bot.commands.size + bot.slashCommands.size}` }
            ]);
        message.channel.send({ embeds: [embed] });
    }
};