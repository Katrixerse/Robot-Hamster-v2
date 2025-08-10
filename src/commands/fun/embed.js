const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'embed',
    aliases: ["embed"],
    description: 'Embeds text',
    usage: 'embed <text>',
    cooldownTime: '1',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const textToEmbed = args.join(' ');
        if (!textToEmbed) return mainFuncs.sendUsage(message, prefix, `embed <text>`, `text`);
        if (textToEmbed.length >= 4096) return mainFuncs.send(message, 'The message is too long to be embedded.');
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .setDescription(`${textToEmbed}`)
            .setFooter({ text: `Used By: ${message.author.username}` })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};