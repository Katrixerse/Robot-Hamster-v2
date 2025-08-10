const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const moment = require('moment');
const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const Giveaway = require('../../handlers/handleGiveaways');

module.exports = {
    name: 'giveaway',
    aliases: ["gw"],
    description: 'Manage giveaways',
    usage: 'giveaway',
    cooldownTime: '3',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ReadMessageHistory],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const status = ["**Waiting for input..**"];

            const components = (state) => {
                ih.create_row();

                ih.makeNewButtonInteraction(`Create a giveaway`, ButtonStyle.Primary, state, `create`, `⚡`);

                ih.makeNewButtonInteraction(`End a giveaway`, ButtonStyle.Primary, state, `end`, `⏱️`);

                ih.makeNewButtonInteraction(`View all giveaways`, ButtonStyle.Primary, state, `view`, `👁️`);

                return [ih.return_row()];
            };

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**GIVEAWAYS**__\n\n**Please select an option..**\n\n__**STATUS**__\n${status.join("\n")}`);

            const init = await message.channel.send({
                embeds: [embed],
                components: components(false)
            });

            const on_collect = (Interaction, collector) => {
                if (Interaction.customId == "create") {

                    status.push("**Waiting to confirm giveaway details..**");

                    const giveaway_details = {
                        prize: undefined,
                        time: parseInt(ms("5m")),
                        locked_roles: [],
                        winners: 1,
                        channel: message.channel
                    };

                    const generate_desc = (giveaway_details) => {
                        return `__**GIVEAWAYS**__\n\n**Current prize:** __${giveaway_details.prize || "not set"}__\n**Current amount of winners:** __${giveaway_details.winners || "not set"}__\n**Current roles giveaway is locked to:** __${giveaway_details.locked_roles?.join(",") || "not set"}__\n**Current time until giveaway is over:** __${!giveaway_details.time ? "not set" : ms(giveaway_details.time)}__\n**Channel the giveaway will happen in:** __${giveaway_details.channel || "not set"}__\n\n__**STATUS**__\n${status.join("\n")}`;
                    };

                    const components = (state) => {
                        ih.create_row();

                        ih.makeNewButtonInteraction(`Change prize`, ButtonStyle.Primary, state, `prize`, `🏅`);

                        ih.makeNewButtonInteraction(`Change amount of winners`, ButtonStyle.Primary, state, `winners`, `1️⃣`);

                        ih.makeNewButtonInteraction(`Change timeout`, ButtonStyle.Primary, state, `timeout`, `⏲️`);

                        ih.makeNewButtonInteraction(`Change locked roles`, ButtonStyle.Primary, state, `roles`, `🔒`);

                        ih.makeNewButtonInteraction(`Change channel`, ButtonStyle.Primary, state, `channel`, `🔂`);

                        const row1 = ih.return_row();

                        ih.create_row();

                        ih.makeNewButtonInteraction(`Confirm giveaway`, ButtonStyle.Secondary, state || !giveaway_details.prize || !giveaway_details.winners || !giveaway_details.time || !giveaway_details.channel, `confirm`, `✅`);

                        const row2 = ih.return_row();

                        return [row1, row2];
                    };

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(generate_desc(giveaway_details));

                    Interaction.update({
                        embeds: [embed],
                        components: components(false)
                    });

                    const on_collect = (Interaction, collector) => {
                        if (Interaction.customId == "prize") {
                            status.push(`**Waiting for you to enter the prize..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(giveaway_details));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                respContent = resp.first().content;

                                status.push(`**Prize edited.**`);

                                giveaway_details.prize = respContent;

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(giveaway_details));

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                                if (resp.deletable) resp.delete();
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "winners") {
                            status.push(`**Waiting for you to enter amount of winners..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(giveaway_details));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                respContent = resp.first().content;

                                const number = parseInt(respContent);

                                if (isNaN(number) || number <= 0 || number > 5000) return mainFuncs.send(message, "That is not a valid number. (1 <= number <= 5000)");

                                status.push(`**Winners edited.**`);

                                giveaway_details.winners = number;

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(giveaway_details));

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                                if (resp.deletable) resp.delete();
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "timeout") {
                            status.push(`**Waiting for you to enter the time.. (example: 5m, 1h, 1d) (time cannot be lower than 5m or higher than 7 days)**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(giveaway_details));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                respContent = resp.first().content;

                                const time = parseInt(ms(respContent));

                                if (isNaN(time) || time < parseInt(ms("5m"))) return mainFuncs.send(message, "That is not a valid time.");
                                if (time > parseInt(ms("5d"))) return mainFuncs.send(message, "Time cannot be longer than 5 days.");


                                status.push(`**Time edited.**`);

                                giveaway_details.time = time;

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(giveaway_details));

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                                if (resp.deletable) resp.delete();
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "roles") {
                            status.push(`**Waiting for you to enter role names.. (Separate role names by a comma) (Example: Muted,Not Verified,Admin)**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(giveaway_details));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                respContent = resp.first().content;

                                const roles = respContent.split(", ");

                                giveaway_details.locked_roles = [];

                                roles.forEach(role => {
                                    const g_role = message.guild.roles.cache.find(r => r.name == role);
                                    if (!g_role) return mainFuncs.send(message, `:warning: "${role}" has not been found in this guild's roles therefore it was not added to locked roles. :warning:`);
                                    if (g_role.position >= message.member.roles.highest.postion || g_role.position >= message.guild.members.me.roles.highest.position) return mainFuncs.send(message, `:warning: "${role}" has a higher/the same position as you or me therefore it was not added to locked roles. :warning:`);
                                    giveaway_details.locked_roles.push(g_role);
                                });

                                status.push(`**Roles edited.**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(giveaway_details));

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                                if (resp.deletable) resp.delete();
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "channel") {
                            status.push(`**Waiting for you to enter the channel name..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(giveaway_details));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                respContent = resp.first().content;

                                const c = message.guild.channels.cache.find(ch => ch.name == respContent);

                                if (!c) return mainFuncs.send(message, `${respContent} was not found in this guild's channels.`);

                                status.push(`**Channel edited.**`);

                                giveaway_details.channel = c;

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(giveaway_details));

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                                if (resp.deletable) resp.delete();
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor(0x00ff00)
                                .setDescription(`**:tada: Giveaway will be starting soon. :tada:**`);

                            Interaction.update({
                                components: [],
                                embeds: [embed]
                            });

                            collector.stop("artificial");

                            const giveawayPrize = giveaway_details.prize;
                            const giveawayWinners = giveaway_details.winners;
                            const giveawayRolesReq = giveaway_details.locked_roles.length > 0 ? giveaway_details.locked_roles.join(",") : "none";
                            const giveawayTime = ms(giveaway_details.time);
                            const giveawayId = "_" + Math.random().toString(36).substr(2, 9);
                            const giveAwayChannel = giveaway_details.channel;
                            const giveawayTimeInt = giveaway_details.time;
                            const giveawayRoleLock = giveaway_details.locked_roles.length > 0 ? giveaway_details.locked_roles.map(x => x.id).join(",") : "none";

                            const giveawayEm = new EmbedBuilder()
                                .setColor(`#F49A32`)
                                .setTimestamp()
                                .setAuthor({ name: bot.user.username })
                                .setThumbnail(bot.user.avatarURL())
                                .setTitle("Giveaway Started!")
                                .setDescription(`Started by: ${message.author}`)
                                .addFields([
                                    { name: "Prize", value: `${giveawayPrize}`, inline: false },
                                    { name: "Winners", value: `${giveawayWinners}`, inline: false },
                                    { name: "Role(s) Required", value: `${giveawayRolesReq}`, inline: false },
                                    { name: "Time left", value: `${giveawayTime}`, inline: false },
                                    { name: "Giveaway ID", value: `${giveawayId}`, inline: false }
                                ]);
                            bot.channels.fetch(giveAwayChannel.id).then(channel => {
                                if (!channel) return;
                                channel.send({ embeds: [giveawayEm] }).then(m => {
                                    con.query("INSERT INTO giveaways (guildId, gid, time, prize, winners, is_active, mid, started_at, channel, sponseredBy, startedby, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [message.guild.id, giveawayId, giveawayTimeInt, con.escape(giveawayPrize), giveawayWinners, "yes", m.id, Date.now().toString(), giveAwayChannel.id, "none", message.author.id, giveawayRoleLock]);
                                    m.react("🎉");
                                    let tm = giveawayTime;
                                    if (parseInt(ms(giveawayTime)) >= parseInt(ms("2h"))) {
                                        const interv = setInterval(() => {
                                            if (parseInt(tm) <= 0) {
                                                clearInterval(interv);
                                            }
                                            if (tm == "-0ms" || tm == "-5m") return clearInterval(interv);
                                            const channel = message.guild.channels.cache.get(giveAwayChannel.id);
                                            if (!channel) return;
                                            channel.messages.fetch(m.id).then(m => {
                                                if (!m) return;
                                                if (m.embeds[0].title.includes("Started")) {
                                                    const em = new EmbedBuilder()
                                                        .setColor(`#F49A32`)
                                                        .setTimestamp()
                                                        .setAuthor({ name: bot.user.username })
                                                        .setThumbnail(bot.user.avatarURL())
                                                        .setTitle("Giveaway Started!")
                                                        .setDescription(`Started by: ${message.author}`)
                                                        .addFields([
                                                            { name: "Prize", value: `${giveawayPrize}`, inline: false },
                                                            { name: "Role(s) Required", value: `${giveawayRolesReq}`, inline: false },
                                                            { name: "Time left", value: `${tm}`, inline: false },
                                                            { name: "Giveaway ID", value: `${giveawayId}`, inline: false }
                                                        ])
                                                        .setFooter({ text: `${giveawayWinners} winner(s)` });
                                                    if (m.editable) m.edit({ embeds: [em] });
                                                    tm = ms(parseInt(ms(tm)) - parseInt(ms("1h")));
                                                } else {
                                                    clearInterval(interv);
                                                }
                                            }).catch(console.error);
                                        }, ms("1h"));
                                        if (parseInt(tm) <= 0) {
                                            clearInterval(interv);
                                        }
                                    } else {
                                        const interv = setInterval(() => {
                                            if (parseInt(tm) <= 0) {
                                                clearInterval(interv);
                                            }
                                            if (tm == "-0ms" || tm == "-5m") return clearInterval(interv);
                                            const channel = message.guild.channels.cache.get(giveAwayChannel.id);
                                            if (!channel) return;
                                            channel.messages.fetch(m.id).then(m => {
                                                if (!m) return;
                                                if (m.embeds[0].title.includes("Started")) {
                                                    const em = new EmbedBuilder()
                                                        .setColor(`#F49A32`)
                                                        .setTimestamp()
                                                        .setAuthor({ name: bot.user.username })
                                                        .setThumbnail(bot.user.avatarURL())
                                                        .setTitle("Giveaway Started!")
                                                        .setDescription(`Started by: ${message.author}`)
                                                        .addFields([
                                                            { name: "Prize", value: `${giveawayPrize}`, inline: false },
                                                            { name: "Role(s) Required", value: `${giveawayRolesReq}`, inline: false },
                                                            { name: "Giveaway ID", value: `${giveawayId}`, inline: false }
                                                        ])
                                                        .setFooter({ text: `${giveawayWinners} winner(s)` });
                                                    if (m.editable) m.edit({ embeds: [em] });
                                                    tm = ms(parseInt(ms(tm)) - parseInt(ms("5m")));
                                                } else {
                                                    clearInterval(interv);
                                                }
                                            }).catch(console.error);
                                        }, ms("5m"));
                                        if (parseInt(tm) <= 0) {
                                            clearInterval(interv);
                                        }
                                    }
                                });
                            }).catch(console.error);
                            setTimeout(() => {
                                con.query(`SELECT * FROM giveaways WHERE guildId="${message.guild.id}" AND gid="${giveawayId}"`, async (e, rows) => {
                                    rows = rows[0];
                                    if (!rows) {
                                        const em = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setTimestamp()
                                            .setAuthor({ name: bot.user.username })
                                            .setThumbnail(bot.user.avatarURL())
                                            .setTitle("Giveaway Has Been Deleted By Someone")
                                            .setDescription(`Giveaway with prize **${giveawayPrize}** has been deleted by someone.`);
                                        return giveAwayChannel.send({ embeds: [em] });
                                    }
                                    const giveaway = new Giveaway.giveaway(rows, giveawayEm, message, bot, con);
                                    await giveaway.end();
                                });
                            }, giveawayTimeInt);
                        }
                    };

                    const on_end = reason => {
                        if (reason == 'artificial') return;
                        if (init.editable) init.edit({ components: components(true) });
                    };

                    ih.create_collector(on_collect, on_end, init);

                    collector.stop("artificial");
                } else if (Interaction.customId == "view") {

                    const text = [];

                    con.query(`SELECT * FROM giveaways WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                        if (!rows || rows.length == 0) {
                            text.push('**No giveaways to view.**');
                        } else {
                            rows.forEach((row, i) => {
                                const utcSecs = row.started_at;
                                const d = new Date(0);
                                d.setUTCMilliseconds(utcSecs);

                                text.push(`**${i + 1}:** **Started at:** ${moment(d).format("DD/MM/YYYY")}\n**Prize:** ${row.prize}\n**Winners: ${row.winners}**\n**Time:** ${ms(row.time)}\n**ID:** ${row.gid} `);
                            });
                        }

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(text.join("\n"));

                        Interaction.update({
                            components: [],
                            embeds: [embed]
                        });

                        collector.stop("artificial");
                    });
                } else {

                    con.query(`SELECT * FROM giveaways WHERE guildId="${message.guild.id}"`, (e, rows) => {

                        if (!rows || rows.length == 0) return mainFuncs.send(message, "There are no giveaways to end.");

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**Please enter giveaway ID...**`);

                        Interaction.update({
                            embeds: [embed],
                            components: []
                        });

                        const filter = m => m.author.id === message.author.id;

                        message.channel.awaitMessages({
                            filter,
                            time: 60000,
                            max: 1
                        }).then(resp => {
                            resp = resp.first().content;

                            con.query(`SELECT * FROM giveaways WHERE guildId="${message.guild.id}" AND gid="${resp}"`, (e, rows) => {

                                if (!rows || rows.length == 0) return mainFuncs.send(message, "No giveaway with that ID was found.");

                                rows = rows[0];

                                const mid = rows.mid;
                                const mes = message.channel.messages.cache.get(mid);
                                if (mes) {
                                    const em = new EmbedBuilder()
                                        .setColor(`#F49A32`)
                                        .setTimestamp()
                                        .setAuthor({ name: bot.user.username })
                                        .setThumbnail(message.author.avatarURL({ dynamic: true }))
                                        .setTitle("Giveaway Ended")
                                        .setDescription(`Ended by: ${message.author}`);
                                    if (mes.editable) mes.edit({ embeds: [em] });
                                }
                                con.query(`DELETE FROM giveaways WHERE guildId="${message.guild.id}" AND gid="${resp}"`);
                                return mainFuncs.send(message, "Giveaway ended.");
                            });
                        }).catch(() => {
                            const embed1 = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**You ran out of time.**`);
                            if (init.editable) init.edit({ embeds: [embed1] });
                        });
                    });
                }
            };

            const on_end = reason => {
                if (reason == 'artificial') return;
                if (init.editable) init.edit({ components: components(true) });
            };

            ih.create_collector(on_collect, on_end, init);
        });
    }
};