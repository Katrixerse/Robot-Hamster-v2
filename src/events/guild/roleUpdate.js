const { EmbedBuilder, PermissionsBitField, ChannelType, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");

const int2RGB2Hex = (num) => {
	num >>>= 0;
	const b = num & 0xFF;
	const g = (num & 0xFF00) >>> 8;
	const r = (num & 0xFF0000) >>> 16;
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const getBits = (bit1, bit2) => {
    const bit = new PermissionsBitField(bit1.bitfield & bit2.bitfield);
    bit1 = bit1.remove([...bit]);
    bit2 = bit2.remove([...bit]);
    return [bit1, bit2];
};

module.exports = (bot, oldRole, newRole) => {
    con.query(`SELECT * FROM serverSettings WHERE guildId="${oldRole.guild.id}"`, async (e, rows) => {
        if (!rows || rows.length === 0) return;
        rows = rows[0];
        if (rows.disabledEvents.includes(`roleUpdate`)) return;
        const clogsEnabled = rows.chatlogs == "on" ? true : false;
        let user = "";
        if (oldRole.guild.members.me.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
            const entry = await oldRole.guild.fetchAuditLogs({
                type: 31
            }).then(audit => audit.entries.first()).catch(console.error);
            if (entry?.target.id === oldRole.id && (entry.createdTimestamp > (Date.now() - 5000))) {
                user = `${entry.executor.tag} (ID: ${entry.executor.id})`;
            }
        }
        if (!clogsEnabled) return;
        const clogschannel = oldRole.guild.channels.cache.find(c => c.name == rows.chatlogsChannel) !== null ? oldRole.guild.channels.cache.find(c => c.name == rows.chatlogsChannel) : undefined;
        if (!clogschannel) return;
        if (!oldRole.guild.members.me.permissionsIn(clogschannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        console.log(`roleUpdate event fired for ${oldRole.guild.name} (${oldRole.guild.id})`);
        const embed = new EmbedBuilder();
        embed.setTimestamp();
        embed.setColor(0xff0000);
        embed.setAuthor({ name: bot.user.username });
        embed.setThumbnail(bot.user.avatarURL());
        embed.setTitle("Role updated");
        embed.addFields([
                { name: "Updated by:", value: `${user >= 1 ? user?.toString() : "Unknown"}`, inline: false }
            ]);
        try {
            if (oldRole.name !== newRole.name) {
                embed.addFields([
                    { name: `Role name:`, value: `Old: ${oldRole.name}\nNew: ${newRole.name}`, inline: false }
                ]);
            } else {
                embed.addFields([
                    { name: `Role name:`, value: `${oldRole.name}`, inline: false }
                ]);
            }
            if (oldRole.position !== newRole.position) {
                embed.addFields([
                    { name: `Role position:`, value: `Old: ${oldRole.position}\nNew: ${newRole.position}`, inline: false }
                ]);
            }
            if (oldRole.color !== newRole.color) {
                const oldColor = int2RGB2Hex(oldRole.color);
                const newColor = int2RGB2Hex(newRole.color);
                embed.addFields([
                    { name: `Role color:`, value: `Old: ${oldColor}\nNew: ${newColor}`, inline: false }
                ]);
            }
            if (oldRole.hoist !== newRole.hoist) {
                embed.addFields([
                    { name: `Role hoist:`, value: `Old: ${oldRole.hoist}\nNew: ${newRole.hoist}`, inline: false }
                ]);
            }
            if (oldRole.mentionable !== newRole.mentionable) {
                embed.addFields([
                    { name: `Role mentionable:`, value: `Old: ${oldRole.mentionable}\nNew: ${newRole.mentionable}`, inline: false }
                ]);
            }
            if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                const [oldRoleUniques, newRoleUniques] = getBits(oldRole.permissions, newRole.permissions);
                const newMap = newRoleUniques.toArray();
                const oldMap = oldRoleUniques.toArray();
                let permsGranted = '';
                let permsTaken = '';
                for (let i = 0; i < newMap.length; i++) {
                    const map = newMap[i];
                    if (!oldMap.includes(map)) {
                        permsGranted += `\`${map}\`\n`;
                    }
                }
                for (let i = 0; i < oldMap.length; i++) {
                    const map = oldMap[i];
                    if (!newMap.includes(map)) {
                        permsTaken += `\`${map}\`\n`;
                    }
                }
                embed.addFields([
                    { name: `Role permissions:`, value: `Granted: ${permsGranted.length != 0 ? permsGranted : `\`None\``}\nTaken: ${permsTaken.length != 0 ? permsTaken : `\`None\``}`, inline: false }
                ]);
            }
            if (embed.data.fields.length >= 2) return clogschannel.send({ embeds: [embed] });
        } catch (err) {
            console.log(`Error in event: roleUpdate \nDetails: ${err.stack}`);
        }
    });
};