const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");

module.exports = (bot, oM, nM) => {
    if (!oM.partial) {
        if (oM.channel.type != ChannelType.GuildText) return;
        if (nM.author.bot) return;
        if (oM.content === nM.content) return;
        if (oM.content.length < 1) return;
        //if (nM.content.length <= 0) return;
        if (oM.content.startsWith("http") || oM.content.startsWith("www")) return;
        con.query(`SELECT * FROM serverSettings WHERE guildId="${oM.guild.id}"`, (e, rows) => {
            if (!rows || rows.length === 0) return;
            rows = rows[0];
            if (rows.disabledEvents.includes(`messageUpdate`)) return;
            const clogsEnabled = rows.chatlogs == "on" ? true : false;
            if (!clogsEnabled) return;
            const clogschannel = oM.guild.channels.cache.find(c => c.name == rows.chatlogsChannel) !== null ? oM.guild.channels.cache.find(c => c.name == rows.chatlogsChannel) : undefined;
            if (!clogschannel) return;
            console.log(`messageUpdate event fired for ${oM.author.tag} (${oM.author.id}) in ${oM.guild.name} (${oM.guild.id})`);
            if (!oM.guild.members.me.permissionsIn(clogschannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
            try {
                const em = new EmbedBuilder()
                    .setTimestamp()
                    .setColor(0x0000ff)
                    .setAuthor({ name: bot.user.username })
                    .setThumbnail(bot.user.avatarURL())
                    .setTitle("Message Edited")
                    .addFields([
                        { name: "Edited By:", value: `${oM.author.tag != null ? oM.author.tag : "Unknown"}`, inline: false },
                        { name: "Old Message:", value: `${oM.content != null ? oM.content.substring(0, 1023) : "Unknown"}`, inline: false },
                        { name: "New Message:", value: `${nM.content != null ? nM.content.substring(0, 1023) : "Unknown"}`, inline: false }
                    ]);
                clogschannel.send({ embeds: [em] });
            } catch (err) {
                console.log(err.stack);
            }
        });
    }
};