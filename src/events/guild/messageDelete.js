const { EmbedBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");
module.exports = (bot, m) => {
    if (!m.partial) {
        if (m.channel.type != ChannelType.GuildText) return;
        if (m.author === null) return;
        if (m.author === bot.user) return;
        con.query(`SELECT * FROM serverSettings WHERE guildId="${m.guild.id}"`, async (e, rows) => {
            if (!rows || rows.length === 0) return;
            rows = rows[0];
            if (rows.disabledEvents.includes(`messageDelete`)) return;
            const clogsEnabled = rows.chatlogs == "on" ? true : false;
            if (!clogsEnabled) return;
            const clogschannel = m.guild.channels.cache.find(c => c.name == rows.chatlogsChannel) !== null ? m.guild.channels.cache.find(c => c.name == rows.chatlogsChannel) : undefined;
            if (!clogschannel) return;
            console.log(`messageDelete event fired for ${m.author.tag} (${m.author.id}) in ${m.guild.name} (${m.guild.id})`);
            if (!m.guild.members.me.permissionsIn(clogschannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
            let user = "";
            if (m.guild.members.me.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
                const entry = await m.guild.fetchAuditLogs({
                    type: 72 // MessageDelete
                }).then(audit => audit.entries.first()).catch(console.error);
                if (entry?.extra.channel.id === m.channel.id && (entry.target.id === m.author.id) && (entry.createdTimestamp > (Date.now() - 5000)) && (entry?.extra.count >= 1)) {
                    user = `${entry.executor.tag} (ID: ${entry.executor.id})`;
                } else {
                    user = `${m.author.tag} (ID: ${m.author.id})`;
                }
            }
            if (m.attachments.size > 0) {
                try {
                    m.attachments.forEach(a => {
                        const embed = new EmbedBuilder()
                            .setTimestamp()
                            .setColor(0xff0000)
                            .setTitle(`Image Deleted`)
                            .addFields([
                                { name: `Deleted By`, value: `${user?.toString()}` },
                                { name: `Message By`, value: `${m.author.tag} (ID: ${m.author.id})` },
                                { name: `Channel`, value: `${m.channel.name.toString()}` }
                            ])
                            .setImage(a.proxyURL)
                            .setFooter({ text: bot.user.username.toString() });
                        clogschannel.send({
                            embeds: [embed]
                        });
                    });
                } catch (err) {
                    console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                }
            } else {
                try {
                    const messFix = m.cleanContent;
                    if (!messFix) return;
                    if (messFix.length === 0) return;
                    const em = new EmbedBuilder()
                        .setTimestamp()
                        .setColor(0xff0000)
                        .setAuthor({ name: bot.user.username })
                        .setThumbnail(bot.user.avatarURL())
                        .setTitle("Message Deleted")
                        .addFields([
                            { name: `Deleted By`, value: `${user?.toString() || 'Unknown'}` },
                            { name: `Message By`, value: `${m.author.tag} (ID: ${m.author.id})` },
                            { name: `Channel`, value: `${m.channel.name.toString()}` },
                            { name: `Message`, value: `${messFix.substring(0, 1024)}` }
                        ]);
                    clogschannel.send({
                        embeds: [em]
                    });
                } catch (err) {
                    console.log(`Error in event messageDelete \nDetails: ${err.stack}`);
                }
            }
        });
    }
};