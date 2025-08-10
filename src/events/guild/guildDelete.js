const { EmbedBuilder } = require('discord.js');
const { removeGuild } = require('../../handlers/handleTables');

const sendToChannel = (bot, guild) => {
    console.log("guildDelete.js: sendToChannel function called.");
    bot.guilds.fetch("790216912160161803").then(g => {
        if (!g) return;
        const ch = g.channels.cache.get("881484473517101066");
        const embed = new EmbedBuilder()
            .setTitle('Guild removed.')
            .setColor(0xFF0000)
            .setDescription(`Owner: ${guild.ownerId}\nName: ${guild.name}\nID: ${guild.id}\nMembercount: ${guild.memberCount}`);
        ch.send({ embeds: [embed] });
    }).catch(console.error);
};

module.exports = (bot, guild) => {
    if (guild.available === false || guild.name === undefined) return;
    if (guild.id === '790216912160161803') return;
    sendToChannel(bot, guild);
    removeGuild(guild.name, guild.id);
};