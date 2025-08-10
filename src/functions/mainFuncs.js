const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { con } = require("./dbConnection.js");

let messageCount = 0;

module.exports = {
    sendUsage: (message, prefix, usage, missing) => {
        const embed = new EmbedBuilder()
            .setColor("#F49A32")
            .setTitle(`Command Usage`)
            .setDescription(`${prefix}${usage}\n\nYou are missing the argument: ${missing}.`);
        return message.channel.send({ embeds: [embed] });
    },
    stickyMessages: (message) => {
        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionFlagsBits.ReadMessageHistory)) return;
        con.query(`SELECT * FROM serverStickyMessages WHERE guildId="${message.guild.id}" AND channelId = ${message.channel.id}`, async (err, rows) => {
            if (err) return console.error(`Error in messageFuncs: stickyMessages \nDetails: ${err.stack}`);
            if (!rows || rows.length === 0) return;
            rows = rows[0];
            messageCount += 1;
            if (rows.messagesBeforeSticky === messageCount) {
                const getLastMessage = await message.guild.channels.cache.get(rows.channelId).messages.fetch(rows.lastStickyMessage).catch((err) => {
                    if (err.message === "Unknown Message") return
                    console.error(`Error in messageFuncs: stickyMessages \nDetails: ${err.stack}`);
                });
                if (!getLastMessage) return;
                if (getLastMessage.deletable) {
                    getLastMessage.delete();
                } 

                const newSticky = new EmbedBuilder()
                    .addFields([
                        { name: `__**Sticky message**__\n\n`, value: `${rows.messageContent}` }
                    ])
                    .setColor(`#F49A32`);

                messageCount = 0;
                const { id } = await message.channel.send({ embeds: [newSticky] });

                return con.promise().query(`UPDATE serverStickyMessages SET lastStickyMessage = "${id}" WHERE guildId = "${message.guild.id}" AND channelId = "${message.channel.id}"`);
            }
        });
    },
    send: (message, text, deleteTime) => {
        const embed = new EmbedBuilder()
            .setDescription(`**${text}**`)
            .setColor(`#F49A32`);
        message.channel.send({ embeds: [embed] }).then(m => {
            if (deleteTime != null && deleteTime >= 1) {
                setTimeout(() => {
                    if (!m.deletable) return m.delete();
                }, deleteTime * 60000);
            }
        });
    },
    customCommands: (message, command) => {
        con.query(`SELECT * FROM serverCustomCommands WHERE guildId="${message.guild.id}"`, (err, rows) => {
            if (err) return console.log(`Error in messageFuncs: customcommands \nDetails: ${err.stack}`);
            if (!rows) return;
            rows.forEach(row => {
                if (command === row.name) {
                    let tosend = row.output.replace(/%NAME%/g, message.author.username).replace(/%PING%/g, message.author).replace(/%GUILDNAME%/g, message.guild.name).replace(/%CHANNELNAME%/g, message.channel.name);
                    const restrictions = {
                        roles: [],
                        channels: [],
                        roles_del: [],
                        roles_add: []
                    };
                    message.guild.roles.cache.forEach(r => {
                        if (tosend.includes(`!${r.name}!`)) {
                            const regx = new RegExp(`!${r.name}!`, "g");
                            tosend = tosend.replace(regx, '');
                            restrictions.roles.push(r.name);
                        } else if (tosend.includes(`+${r.name}+`)) {
                            const regx = new RegExp(`\\\+${r.name}\\\+`, "g");
                            tosend = tosend.replace(regx, '');
                            restrictions.roles_add.push(r.name);
                        } else if (tosend.includes(`-${r.name}-`)) {
                            const regx = new RegExp(`-${r.name}-`, "g");
                            tosend = tosend.replace(regx, '');
                            restrictions.roles_del.push(r.name);
                        }
                    });
                    message.guild.channels.cache.forEach(c => {
                        if (tosend.includes(`^${c.name}^`)) {
                            const regx = new RegExp(`\\\^${c.name}\\\^`, "g");
                            tosend = tosend.replace(regx, '');
                            restrictions.channels.push(c.name);
                        }
                    });
                    if (restrictions.roles.length > 0) {
                        if (!message.member.roles.cache.some(r => restrictions.roles.includes(r.name))) return;
                    }
                    if (restrictions.channels.length > 0) {
                        if (!restrictions.channels.includes(message.channel.name)) return;
                    }
                    restrictions.roles_add.forEach(ro => {
                        const toadd = message.guild.roles.cache.find(r => r.name === ro);
                        if (toadd) {
                            message.member.roles.add(toadd);
                        }
                    });
                    restrictions.roles_del.forEach(ro => {
                        const torem = message.guild.roles.cache.find(r => r.name === ro);
                        if (torem) {
                            message.member.roles.remove(torem);
                        }
                    });
                    if (tosend.length <= 0) return;
                    message.channel.send(tosend);
                }
            });
        });
    }
};