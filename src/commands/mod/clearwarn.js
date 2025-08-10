const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'clearwarn',
    aliases: ['clearwarns'],
    description: 'Clear someone\'s warns',
    usage: 'clearwarn <user>',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.KickMembers, checkRank)) return;
            if (!args[0]) return mainFuncs.sendUsage(message, prefix, `clearwarn <user>`, `user`);
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => m.user.username.toLowerCase() == args[0].toLowerCase()) || message.guild.members.cache.find(m => m.displayName.toLowerCase() == args[0].toLowerCase());
            if (!member) return mainFuncs.send(message, `Couldn't find the member, please try again.`);
            const check = modFuncs.comparePos(member, message);
            if (check) return mainFuncs.send(message, "That person has a role with a higher or the same position as you.");
            con.query(`SELECT * FROM warnings WHERE guildId="${message.guild.id}" AND userId="${member.id}"`, (err, rows) => {
                if (e) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                if (rows) {
                    if (rows.length <= 0) return mainFuncs.send(message, "That member has no warns.");
                }

                const em2 = new EmbedBuilder()
                    .setThumbnail(bot.user.avatarURL())
                    .setAuthor({ name: bot.user.username })
                    .setFooter({ text: message.guild.name })
                    .setColor(`#F49A32`)
                    .setTitle("Warning(s) cleared")
                    .addFields([
                        { name: "Member", value: `**Username:**${member.user.username}\n**ID:** ${member.user.id}`, inline: true },
                        { name: "Moderator", value: `${message.author.username}`, inline: true }
                    ]);
                message.channel.send("***What would you like to do?***\n\`\`\`[1] Clear a certain warning\n[2] Clear all warns\`\`\`");

                const filter = m => m.author.id === message.author.id;

                message.channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 30000
                }).then(r => {
                    r = r.first().content;
                    if (r == "1") {
                        const em = new EmbedBuilder()
                            .setTimestamp()
                            .setColor(`#F49A32`)
                            .setThumbnail(bot.user.avatarURL())
                            .setFooter({ text: bot.user.username })
                            .setDescription("Enter the number of the warning to clear it")
                            .setTitle("Warns");
                        rows.forEach((row, i) => {
                            const reason = row.warn_reason;
                            const warned_by = row.warned_by;
                            const date = row.warn_date;
                            em.addFields([
                                { name: `Warn #${i + 1}`, value: `**Reason:** ${reason}\n**Warned by:** ${warned_by}\n**Date:** ${date}`, inline: true }
                            ]);
                        });
                        message.channel.send({ embeds: [em] });
                        message.channel.awaitMessages({
                            filter,
                            max: 1,
                            time: 30000
                        }).then(msg => {
                            msg = parseInt(msg.first().content);
                            if (isNaN(msg) || msg > rows.length || msg <= 0 || !isFinite(msg)) return mainFuncs.send(message, "Not a valid number.");
                            em.fields.forEach(field => {
                                if (field.name.startsWith(msg.toString())) {
                                    const chosen_reason = field.value.split("\n")[0].split("Reason: ").join("");
                                    con.query(`DELETE FROM warnings WHERE guildId="${message.guild.id}" AND userId="${member.id}" AND warn_reason="${chosen_reason}"`);
                                    mainFuncs.send(message, "Warning cleared.");

                                    // send log
                                    modFuncs.sendToModChannel(message, em2);
                                }
                            });
                        });
                    } else if (r == "2") {
                        rows.forEach(row => {
                            con.query(`DELETE FROM warnings WHERE guildId="${message.guild.id}" AND userId="${member.id}"`);
                        });
                        mainFuncs.send(message, "Warnings cleared.");
                        modFuncs.sendToModChannel(message, em2);
                    } else {
                        mainFuncs.send(message, "Command cancelled.");
                    }
                });
            });
        });
    }
};