const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const responses = [
    `● It is certain.`,
    `● It is decidedly so.`,
    `● Without a doubt.`,
    `● Yes - definitely.`,
    `● You may rely on it.`,
    `● As I see it, yes.`,
    `● Most likely.`,
    `● Outlook good.`,
    `● Yes.`,
    `● Signs point to yes.`,
    `● Reply hazy, try again.`,
    `● Ask again later.`,
    `● Better not tell you now.`,
    `● Cannot predict now.`,
    `● Concentrate and ask again.`,
    `● Don't count on it.`,
    `● My reply is no.`,
    `● My sources say no.`,
    `● Outlook not so good.`,
    `● Very doubtful.`
];

module.exports = {
    name: '8ball',
    aliases: ["8ball"],
    description: 'Ask the 8ball a question',
    usage: '8ball <question>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const question = args.join(` `);
        if (!question) return mainFuncs.sendUsage(message, prefix, `8ball <question>`, `question`);
        if (question.length >= 1024) return mainFuncs.send(message, `The question is too long. Please shorten it and try again.`);
        const response = responses[Math.floor(Math.random() * responses.length)];
        const embed = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setColor(`#F49A32`)
            .setFooter({ text: bot.user.username })
            .setTitle(`Magic 8ball`)
            .addFields([
                { name: `Question`, value: `${question.endsWith("?") ? question : question + "?"}`, inline: true },
                { name: `Answer`, value: `${response}`, inline: true }
            ])
            .setThumbnail(bot.user.avatarURL());
        message.channel.send({ embeds: [embed] });
    }
};