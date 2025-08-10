const { EmbedBuilder } = require("discord.js");
const mathjs = module.require("mathjs");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'math',
    aliases: ["calc"],
    description: 'Solves a math problem.',
    usage: 'math <problem>',
    cooldownTime: '1',
    group: 'misc',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (args.length == 0) return mainFuncs.sendUsage(message, prefix, `book <name>`, `name`);
        try {
            const input = args.join(" ");
            const result = mathjs.evaluate(input);
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle('Calculator')
                .addFields([
                    { name: 'Input:', value: `${input}` },
                    { name: 'Result:', value: `${result}` }
                ])
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle('Calculator')
                .addFields([
                   { name: 'Error:', value: "Input could not be evaulated." }
                ])
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        }
    }
};