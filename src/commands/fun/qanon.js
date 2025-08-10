const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'qanon',
    aliases: ["qanon"],
    description: 'Turns your text into green',
    usage: 'qanon <text>',
    cooldownTime: '1',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const textToChange = args.join(' ');
        if (!textToChange) return mainFuncs.sendUsage(message, prefix, `qanon <text>`, `text`);
        if (textToChange.length >= 4096) return mainFuncs.send(message, 'The message is too long to be embedded.');
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .setDescription(`\`\`\`diff\n+ ${textToChange}\n\`\`\``)
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};