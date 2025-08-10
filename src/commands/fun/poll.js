const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'poll',
    aliases: ["poll"],
    description: 'Starts a poll',
    usage: 'poll <text>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const textToEmbed = args.join(' ');
        if (!textToEmbed) return mainFuncs.sendUsage(message, prefix, `poll <text>`, `text`);
        if (textToEmbed.length >= 1023) return mainFuncs.send(message, 'The message is too long.');
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .setDescription(`${textToEmbed}`)
            .setFooter({ text: `Used By: ${message.author.username}` })
            .setTimestamp();
        message.channel.send({ embeds: [embed] }).then((m => { m.react('✅'); m.react('❎'); }));
    }
};