const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");

module.exports = (bot, oM, nM) => {
    con.query(`SELECT * FROM serverSettings WHERE guildId="${oM.guild.id}"`, (err, rows) => {
        if (err) return console.log(`Error in event: guildMemberUpdate \nDetails: ${err.stack}`);
        if (!rows || rows.length == 0) return;
        rows = rows[0];
        if (!rows) return;
        if (rows.disabledEvents.includes(`memberUpdate`)) return;
        const clogsEnabled = rows.chatlogs == "on" ? true : false;
        if (!clogsEnabled) return;
        const clogschannel = oM.guild.channels.cache.find(c => c.name === rows.chatlogsChannel) !== null ? oM.guild.channels.cache.find(c => c.name === rows.chatlogsChannel) : undefined;
        if (!clogschannel) return;
        console.log(`guildMemberUpdate event fired for ${oM.user.tag} (${oM.user.id}) in ${oM.guild.name} (${oM.guild.id})`);
        if (clogschannel.type != ChannelType.GuildText) return;
        if (!oM.guild.members.me.permissionsIn(clogschannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        if (oM.nickname !== nM.nickname) {
            // NICKNAME UPDATE
            const em = new EmbedBuilder()
            .setTimestamp()
            .setColor(0xff0000)
            .setAuthor({ name: bot.user.username })
            .setThumbnail(bot.user.avatarURL())
            .setTitle("Member Nickname Changed")
            .addFields([
                { name: "Member", value: `${oM.displayName != null ? oM.displayName : "Unknown"}`, inline: false },
                { name: "Old Nickname", value: `${oM.nickname != null ? oM.nickname : "None"}`, inline: false },
                { name: "New Nickname", value: `${nM.nickname != null ? nM.nickname : "None"}`, inline: true }
            ]);
            clogschannel.send({ embeds: [em] });
        } else if (oM.roles.cache.size > nM.roles.cache.size) {
            // ROLES -
            let role;
            oM.roles.cache.forEach(r => {
                if (!nM.roles.cache.get(r.id)) role = r;
            });
            const em = new EmbedBuilder()
            .setTimestamp()
            .setColor(0xff0000)
            .setAuthor({ name: bot.user.username })
            .setThumbnail(bot.user.avatarURL())
            .setTitle("Role Removed")
            .addFields([
                { name: "From:", value: `${oM.displayName != null ? oM.displayName : "Unknown"}`, inline: false },
                { name: "Role:", value: `${role.name != null ? role.name : "Unknown"}`, inline: false }
            ]);
            clogschannel.send({ embeds: [em] });
        } else if (oM.roles.cache.size < nM.roles.cache.size) {
            // ROLES +
            let role;
            nM.roles.cache.forEach(r => {
                if (!oM.roles.cache.get(r.id)) role = r;
            });
            const em = new EmbedBuilder()
            .setTimestamp()
            .setColor(0x00ff00)
            .setAuthor({ name: bot.user.username })
            .setThumbnail(bot.user.avatarURL())
            .setTitle("Role Added")
            .addFields([
                { name: "From:", value: `${oM.displayName != null ? oM.displayName : "Unknown"}`, inline: false },
                { name: "Role:", value: `${role.name != null ? role.name : "Unknown"}`, inline: false }
            ]);
            clogschannel.send({ embeds: [em] });
        }
    });
};