const { con } = require("./dbConnection.js");
const cooldown = new Set();
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const ms = require('ms');

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const cashCooldown = new Set();

module.exports = {
    handleCash: (message) => {
        const cashToGive = getRndInteger(50, 100);
        if (cashCooldown.has(message.author.id) && cashCooldown.has(message.guild.id)) return;
        con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, (err, row) => {
            con.query(`SELECT * FROM serverCashSettings WHERE guildId ="${message.guild.id}"`, (e, cashSettings) => {
                if (err) return console.log(err.stack);
                row = row[0];
                if (!row || row.length == 0) {
                    con.query(`INSERT INTO serverCash (guildId, userId, userPurse, userBank, userGems, dailyLastClaimed, dailyStreak) VALUES (?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, message.author.id, cashToGive, 0, 0, 'none', 0]);
                    if (!cashCooldown.has(message.guild.id)) cashCooldown.add(message.guild.id);
                    cashCooldown.add(message.author.id);
                } else if (row.length >= 2) {
                    con.query(`DELETE FROM serverCash WHERE guildId ="${message.guild.id}" AND userId ="${message.author.id}" LIMIT 1`);
                } else if (cashSettings.length === 0) {
                    con.query(`INSERT INTO serverCashSettings (guildId, currencyType, minAmount, maxAmount, blockedChannels, allowBoosters, disableRobbing) VALUES (?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, "$", 50, 100, "none", "true", "false"]);
                } else {
                    con.query(`UPDATE serverCash SET userPurse = ${row.userPurse += cashToGive} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`);
                    if (!cashCooldown.has(message.guild.id)) cashCooldown.add(message.guild.id);
                    cashCooldown.add(message.author.id);
                }
            });
        });
        setTimeout(() => {
            cashCooldown.delete(message.author.id);
        }, 60000);
    },
    handleLevels: (message) => {
        con.query(`SELECT * FROM serverLevels WHERE guildId ="${message.guild.id}" AND userId ="${message.author.id}"`, (e, row2) => {
            if (cooldown.has(`${message.guild.id}:${message.author.id}`)) return;
            con.query(`SELECT * FROM profileSettings WHERE guildId ="${message.guild.id}" AND userId ="${message.author.id}"`, async (e, pfStg) => {
                if (!pfStg || pfStg.length === 0) {
                    return con.promise().query(`INSERT INTO profileSettings (guildId, userId, textColor, background, font, fontStyle, bckgColor) VALUES (?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, message.author.id, "#FFFFFF", "default", "default", "default", "#212121"]);
                }
            });
            if (row2.length == 0) {
                return con.promise().query(`INSERT INTO serverLevels (guildId, userId, userLevel, userXP, userBadges) VALUES (?, ?, ?, ?, ?)`, [message.guild.id, message.author.id, 1, 1, 'none']);
            } else {
                con.query(`SELECT * FROM serverLevelSettings WHERE guildId ="${message.guild.id}"`, (e, levelSettings) => {
                    if (levelSettings.length == 0) {
                        return con.promise().query(`INSERT INTO serverLevelSettings (guildId, minAmount, maxAmount, xpNeeded, maxLevel, levelUpMessages, badges, blockedChannels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, 50, 100, 300, 100, "yes", "disabled", "none"]);
                    } else {
                        row2 = row2[0];
                        levelSettings = levelSettings[0];
                        if (levelSettings.blockedChannels.includes(message.channel.name)) return;
                        if (row2.userLevel >= levelSettings.maxLevel) return;
                        const xptoget = row2.userLevel * 3 * levelSettings.xpNeeded + levelSettings.xpNeeded;
                        const xptogive = Math.floor(Math.random() * (levelSettings.maxAmount - levelSettings.minAmount) + levelSettings.minAmount);
                        con.query(`UPDATE serverLevels SET userXP = ${row2.userXP + xptogive} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`);
                        cooldown.add(`${message.guild.id}:${message.author.id}`);
                        if (row2.userXP >= xptoget) {
                            con.query(`UPDATE serverLevels SET userLevel = ${row2.userLevel + 1}, userXP = ${row2.userXP - xptoget} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`, () => {
                                if (levelSettings.levelUpMessages === "yes") {
                                    const embed = new EmbedBuilder()
                                        .setColor(`#F49A32`)
                                        .setDescription(`Leveled up to: ${row2.userLevel + 1}`)
                                        .setTitle(`${message.author.username} has leveled up!`);
                                    message.channel.send({ embeds: [embed] });
                                }
                                con.query(`SELECT * FROM serverLevelRewards WHERE guildId ="${message.guild.id}"`, (e, levelRewards) => {
                                    if (!levelRewards || levelRewards.length === 0) return;
                                    levelRewards.forEach(row => {
                                        const role = message.guild.roles.cache.find(role => role.id === row.role);
                                        if (!role) return;
                                        if (!role.editable) return;
                                        if (message.member.roles.cache.some(r => r.id == row.role)) return;
                                        if (role.position >= message.member.roles.highest.position) return;
                                        if (row2.userLevel + 1 >= row.levelRequired) {
                                            message.member.roles.add(row.role, 'Level up role rewards');
                                            if (levelSettings.levelUpMessages === "yes") {
                                                message.channel.send(`GG, ${message.author.username} got role: ${role.name} as a reward`);
                                            }
                                        }
                                    });
                                });
                            });
                        }
                    }
                    setTimeout(() => {
                        cooldown.delete(`${message.guild.id}:${message.author.id}`);
                    }, ms("1m"));
                });
            }
        });
    },
    modMailMsgs: async (message) => {
        if (message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
            const members = await message.guild.members.fetch({ query: message.author.username, limit: 1 });
            if (members.size == 0) return;
            const found_member = members.find(m => m.user.username.toLowerCase().substring(0, 15).replace(/\s/g, "-") == message.channel.name);
            const getCategory = message.guild.channels.cache.find(c => c.type == ChannelType.GuildCategory && c.name.toLowerCase() == "modmail");
            if (found_member && getCategory) {
               let send_embed = new EmbedBuilder()
                   .setColor(0x0000ff)
                   .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) })
                   .setTitle(`Message Received`)
                   .setTimestamp()
                   .setDescription(message.content == 0 ? "Admin did not include message content." : message.content);
               let sent_embed = new EmbedBuilder()
                   .setColor(0x0000ff)
                   .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) })
                   .setTitle(`Message Sent`)
                   .setTimestamp()
                   .setDescription(message.content == 0 ? "You did not include any content." : message.content);
               if (message.attachments.size > 0) {
                   send_embed = send_embed.setImage(message.attachments.first().url);
                   sent_embed = sent_embed.setImage(message.attachments.first().url);
               }
               if (message && message.deletable) {
                message.delete();
               }
               message.channel.send({ embeds: [sent_embed] });
               found_member.send({ embeds: [send_embed] });
           }
       }
    }
};