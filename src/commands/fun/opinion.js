const { EmbedBuilder } = require('discord.js');
const mainFuncs = require('../../functions/mainFuncs');
module.exports = {
    name: 'opinion',
    aliases: ["opinion"],
    description: 'Bot gives you his opinion on something.',
    usage: 'opinion <text>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const input = args.join(` `);
            if (!input) return mainFuncs.sendUsage(message, prefix, `poll <text>`, `text`);
            const opinions = [`I have a good opinion about ${input}! :+1:`, `I hate ${input}.. :nauseated_face:`, `${input} is okay, I guess.`];
            const opinion = opinions[Math.floor(Math.random() * opinions.length)];
            const em = new EmbedBuilder()
                .setDescription(`**My opinion:** ${opinion}`)
                .setColor(`#F49A32`);
            message.channel.send({ embeds: [em] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};