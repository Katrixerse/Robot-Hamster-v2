const { con } = require("./dbConnection.js");
const { EmbedBuilder, ChannelType } = require("discord.js");
module.exports = {
    comparePos: (member, message) => {
        if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return true;
        } else if (member.roles.highest.position >= message.member.roles.highest.position) {
            return true;
        } else {
            return false;
        }
    },
    checkPerms: (message, permission, rank) => {
        if (!message.member.permissions.has(permission) && rank === 0) {
            return false;
        } else {
            return true;
        }
    },
    updateCn: (message) => {
        con.query(`SELECT * FROM casenumber WHERE guildId="${message.guild.id}"`, (err, row) => {
            if (err) return console.log(err.stack);
            row = row[0];
            con.query(`UPDATE casenumber SET cn=${row.cn + 1} WHERE guildId="${message.guild.id}"`);
            return;
          });
    },
    sendToChannel: (message, embed) => {
        con.query(`SELECT modlogsChannel, modlogs FROM serverSettings WHERE guildId="${message.guild.id}"`, (err, row) => {
            if (err) return console.log(`Error in messageFuncs: sendToModChannel \nDetails: ${err.stack}`);
            if (!row) return;
            row = row[0];
            const finder = message.guild.channels.cache.find(c => c.name == row.modlogsChannel);
            if (!finder) return;
            if (finder.type != ChannelType.GuildText) return;
            if (row.modlogs == "off") return;
            finder.send({ embeds: [embed] });
          });
    },
    sendLog: (action, message, member, reason) => {
        con.query(`SELECT casen.cn, ss.modlogsChannel, ss.modlogs FROM casenumber as casen LEFT JOIN serverSettings as ss ON ss.guildId = casen.guildId WHERE casen.guildId="${message.guild.id}"`, (err, row) => {
            if (!row) return;
            if (err) return console.log(err.stack);
            row = row[0];
            con.query(`UPDATE casenumber SET cn=${row.cn + 1} WHERE guildId="${message.guild.id}"`);
            if (row.modlogs == "off") return;
            const em = new EmbedBuilder();
            if (member != "none") {
                em.addFields([
                    { name: "User:", value: `${member.user.tag}`, inline: false },
                ]);
            } 
            em.setColor(`#F49A32`);
            em.setTitle(`${action}`);
            em.addFields([
                { name: "Moderator:", value: `${message.author == null ? message.user.tag : message.author.tag}`, inline: false },
                { name: "Reason:", value: `${reason.substring(0, 1023)}`, inline: false },
                { name: "Case Number:", value: `#${parseInt(row.cn + 1)}`, inline: false }

            ]);
            const finder = message.guild.channels.cache.find(c => c.name == row.modlogsChannel);
            if (!finder) return;
            if (finder.type != ChannelType.GuildText) return;
            finder.send({ embeds: [em] });
        });
    },
    sendToModChannel: (message, embed) => {
        con.query(`SELECT modlogsChannel, modlogs FROM serverSettings WHERE guildId="${message.guild.id}"`, (err, row) => {
          if (err) return console.log(`Error in messageFuncs: sendToModChannel \nDetails: ${err.stack}`);
          if (!row) return;
          row = row[0];
          if (row.modlogs == "off") return;
          const finder = message.guild.channels.cache.find(c => c.name == row.modlogsChannel);
          if (!finder) return;
          if (finder.type != ChannelType.GuildText) return;
          finder.send({ embeds: [embed] });
        });
    },
    auditLog: (message, action, member) => {
        con.query(`SELECT auditLog FROM serverAudit WHERE guildId="${message.guild.id}"`, async (err, row) => {
            con.query(`UPDATE serverAudit SET auditLog="${row[0].auditLog + `\n${action} ${member.user.tag} by ${message.author.tag} at: ${Date.now()}`}" WHERE guildId="${message.guild.id}"`);
            const newLog = [];
            await row.auditLog.split("at: ").map(x => {
                if (parseInt(x[1]) <= 86400000 * 7) {
                    newLog.push(x);
                }
            })
            if (newLog.length >= 1) {
                con.query(`UPDATE serverAudit SET auditLog="${newLog}" WHERE guildId="${message.guild.id}"`);
            }
        });
    }
};