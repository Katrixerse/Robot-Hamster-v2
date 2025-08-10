const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'topguilds',
    aliases: ["topguilds"],
    description: 'Shows the guilds the bot is in ordered by their membercount',
    usage: 'topguilds',
    cooldownTime: '5',
    group: 'dev',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (message.author.id !== "130515926117253122" && message.author.id !== "307472480627326987") return message.channel.send("Only the bot developers can use this command.");
        const guilds = bot.guilds.cache.sort((a, b) => b.memberCount - a.memberCount);

        const description = guilds.map((guild, index) => {
            return `${index + 1}. ${guild.name} (ID: ${guild.id}) Membs ${guild.memberCount}`;
        }).join("\n");

        const embed = new EmbedBuilder()
            .setTitle(`Top Guilds`)
            .setDescription(`${description.substring(0, 4096)}`)
        message.channel.send({ embeds: [embed] });
    }
};