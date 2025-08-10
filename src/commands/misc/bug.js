const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'bug',
    aliases: ["bug"],
    description: 'Report a bug.',
    usage: 'bug',
    cooldownTime: '1',
    group: 'misc',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        mainFuncs.send(message, `What's the command you would like to report?`);
        const filter = m => m.author.id === message.author.id;
        message.channel.awaitMessages({ filter, max: 1, errors: ["time"], time: 30000 }).then(async (command) => {
            command = command.first();
            if (!bot.commands.get(command.content.toLowerCase()) && !bot.commands.get(bot.aliases.get(command.content.toLowerCase()))) return mainFuncs.send(message, `Thats not a valid command.`);
            message.channel.send(`Please give us details of the issue/error so it can be fixed.`);
            message.channel.awaitMessages({ filter, max: 1, errors: ["time"], time: 240000 }).then(async (details) => {
                details = details.first();
                if (!details.length > 1000) return mainFuncs.send(message, `Thats too long of a description Please join the support discord and dm one of the devs.`);
                const createEmbed = new EmbedBuilder()
                    .setThumbnail(bot.user.avatarURL())
                    .setColor(`#F49A32`)
                    .setTitle(`Bug report`)
                    .setDescription(`**Command:** ${command.content}\n**Details:** ${details.content}`)
                    .setFooter({ text: `Sent from: ${message.author.tag} (ID: ${message.author.id})` });
                bot.guilds.fetch("790216912160161803").then(guild => {
                    if (!guild) return;
                    const channel = guild.channels.cache.get("873318914728276008");
                    if (!channel) return console.log(`Channel not found.`);
                    channel.send({ embeds: [createEmbed] });
                }).catch(console.error);
                mainFuncs.send(message, `Thanks for your bug report, one of the devs will review it soon.`);
            });
        });
    }
};