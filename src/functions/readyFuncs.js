const { EmbedBuilder, PermissionFlagsBits, ChannelType, ButtonStyle } = require('discord.js');
const IH = require("../handlers/interactions").IH;
const con = require("./dbConnection").con;
const { dblkey, dbggkey, topggkey } = require('../../config.json');
const { AutoPoster } = require('topgg-autoposter');
const Monitor = require("../handlers/handleTwitch");
const request = require('node-superfetch');
const ms = require("ms");
const { checkPosts } = require('../handlers/handleReddit');
module.exports = {
    setStatus: (bot) => {
        setInterval(() => {
            // set bot status
            bot.user.setPresence({ activities: [{ name: `r!help | In ${bot.guilds.cache.size} servers.` }] });
            // update bot stats
        }, ms(`3h`));

        //const topGGStats = AutoPoster(`${topggkey}`, bot);

        /*topGGStats.on('error', (err) => {
            if (err.mmessage === "520 undefined") return;
            if (err.mmessage === "504 Gateway Time-out") return;
            if (err.message === "408 Request Timeout") return;
            console.log("Top.gg: " + err.message);
        });*/
    },
    serverStats: (bot, guild) => {
        con.query(`SELECT * FROM serverSettings WHERE guildId="${guild.id}"`, async (e, rows) => {
            if (!rows || rows.length == 0) return;
            if (rows[0].serverStats === 'enabled') {
                if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) return;
                await guild.members.fetch({ time: 300000 });

                const guild_channels = await guild.channels.fetch();

                const sscategory = guild_channels.find(c => c.type == ChannelType.GuildCategory && c.name == "📊 Server Stats");
                const ssctotal = guild_channels.find(c => c.type == ChannelType.GuildVoice && c.name.split("-")[0] == "members");
                const sscbots = guild_channels.find(c => c.type == ChannelType.GuildVoice && c.name.split("-")[0] == "bots");
                const permOw = [];

                const everyone = guild.roles.cache.find(r => r.name == "@everyone");

                permOw.push({
                    id: everyone.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                    deny: [PermissionFlagsBits.Connect]
                });

                if (!sscategory) {
                    guild.channels.create({
                        name: "📊 Server Stats",
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: permOw,
                        position: 1
                    });
                }

                if (!ssctotal && !sscbots) {
                    const guild_channels = await guild.channels.fetch();
                    const parent = guild_channels.find(c => c.type == ChannelType.GuildCategory && c.name == "📊 Server Stats");

                    guild.channels.create({
                        name: `members-${guild.memberCount}`,
                        type: ChannelType.GuildVoice,
                        parent: parent
                    });
                    guild.channels.create({
                        name: `bots-${guild.members.cache.filter(member => member.user.bot).size}`,
                        type: ChannelType.GuildVoice,
                        parent: parent
                    });

                    setInterval(() => {
                        if (!parent) return clearInterval();
                        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) return clearInterval();
                        if (rows[0].serverStats === 'disabled') return clearInterval();
                        const ssctotal = guild_channels.find(c => c.type == ChannelType.GuildVoice && c.name.split("-")[0] == "members");
                        if (!ssctotal) return clearInterval();
                        if (!guild.members.me.permissionsIn(ssctotal).has(PermissionFlagsBits.ViewChannel)) return clearInterval();
                        const sscbots = guild_channels.find(c => c.type == ChannelType.GuildVoice && c.name.split("-")[0] == "bots");
                        if (!sscbots) return clearInterval();
                        if (!guild.members.me.permissionsIn(sscbots).has(PermissionFlagsBits.ViewChannel)) return clearInterval();
                        if (ssctotal.name.split("-")[1] != guild.memberCount) {
                            ssctotal.setName(`members-${guild.memberCount}`);
                        }
                        if (sscbots.name.split("-")[1] != guild.members.cache.filter(member => member.user.bot).size) {
                            sscbots.setName(`bots-${guild.members.cache.filter(member => member.user.bot).size}`);
                        }
                    }, ms('5m'));
                } else {
                    const guild_channels = await guild.channels.fetch();
                    const parent = guild_channels.find(c => c.name == "📊 Server Stats" && c.type == ChannelType.GuildCategory);
                    //ssctotal.setParent(parent);
                    //sscbots.setParent(parent);
                    setInterval(() => {
                        if (!parent) return clearInterval();
                        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) return clearInterval();
                        if (rows[0].serverStats === 'disabled') return clearInterval();
                        const ssctotal = guild_channels.find(c => c.type == ChannelType.GuildVoice && c.name.split("-")[0] == "members");
                        if (!ssctotal) return clearInterval();
                        if (!guild.members.me.permissionsIn(ssctotal).has(PermissionFlagsBits.ViewChannel)) return clearInterval();
                        const sscbots = guild_channels.find(c => c.type == ChannelType.GuildVoice && c.name.split("-")[0] == "bots");
                        if (!sscbots) return clearInterval();
                        if (!guild.members.me.permissionsIn(sscbots).has(PermissionFlagsBits.ViewChannel)) return clearInterval();
                        if (ssctotal.name.split("-")[1] != guild.memberCount) {
                            ssctotal.setName(`members-${guild.memberCount}`);
                        }
                        if (sscbots.name.split("-")[1] != guild.members.cache.filter(member => member.user.bot).size) {
                            sscbots.setName(`bots-${guild.members.cache.filter(member => member.user.bot).size}`);
                        }
                    }, ms('5m'));
                }
            }
        });
    },
    twitchAlerts: (bot, guild) => {
        con.query(`SELECT * FROM serverTwitch WHERE guildId="${guild.id}"`, async (e, rows) => {

            if (!rows || rows.length == 0 || rows[0].username == "not set" || rows[0].channel == "not set") return;
            rows = rows[0];
            if (rows.receivingAlerts == "no") return;
            const USERNAME = rows.username;
            const CHANNEL = guild.channels.cache.get(rows.channel);
            if (!guild.members.me.permissionsIn(CHANNEL).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
            if (!CHANNEL) return;
            const monitor = new Monitor(USERNAME, guild.id, con);
            await monitor.start();
            monitor.onLive(async (data, user) => {
                const difference = ms(await monitor.calcDiffDates(), { long: true });
                const TITLE = parseInt(ms(difference)) > parseInt(ms("2m")) ? `${USERNAME} went live ${difference} ago! ` : `${USERNAME} just went live!`;
                const embed = new EmbedBuilder()
                    .setTitle(TITLE)
                    .setTimestamp(data.startDate)
                    .setAuthor({ name: "TwitchTV", iconURL: "https://img.utdstc.com/icon/c28/b9e/c28b9efbfb9482de979459bc95d9951e18ee05228dab49c6dac9b70ee800c9c6:200" })
                    .setColor(0x8A2BE2)
                    .addFields([
                        { name: `Viewers`, value: `${data.viewers?.toString()}`, inline: true },
                        { name: `Game`, value: `${data.gameName}`, inline: true },
                        { name: `Title`, value: `${data.title}`, inline: true }
                    ])
                    .setThumbnail(user.profilePictureUrl)
                    .setImage(data.getThumbnailUrl(500, 300));

                const ih = new IH(undefined);
                const components = () => {
                    ih.create_row();
                    ih.makeNewButtonInteraction(`Live here`, ButtonStyle.Link, false, undefined, undefined, `https://twitch.tv/${USERNAME}`);
                    return [ih.return_row()];
                };
                if (rows.messageContent != 'none') {
                    CHANNEL.send({ content: `${rows.messageContent}`, embeds: [embed], components: components() });
                } else {
                    CHANNEL.send({ embeds: [embed], components: components() });
                }
            });
        });
    },
    giveaways: (bot, guild) => {
        con.query(`SELECT * FROM giveaways WHERE guildId="${guild.id}"`, (e, rows) => {
            if (!rows) return;

            // GET THE CHANNEL AND EDIT THE MESSAGE WITH THE NEW TIME
            rows.forEach((row) => {
                // GIVEAWAY RELATED VARS
                const startedat = row.started_at;
                const giveawaytime = row.time;
                const giveawayId = row.gid;
                const startedby = row.startedby;
                const roleRequired = row.role;
                const giveawayPrize = row.prize;
                const giveawayWinners = row.winners;
                // TIME
                const now = Date.now();
                const hmt = now - startedat;
                const time_left = giveawaytime - hmt;
                const channel = guild.channels.cache.get(row.channel);
                if (!channel) return console.log('no channel');
                if (!guild.members.me.permissionsIn(channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory])) return;
                let roleNames = [];
                roleRequired.split(', ').forEach(r => { roleNames.push(`<@&${r}>`) });
                const getStartedBy = guild.members.fetch(startedby);
                if (!getStartedBy) return;
                channel.messages.fetch(row.mid).then(m => {
                    if (!m) return;

                    // CREATE A NEW GIVEAWAY INSTANCE
                    const Giveaway = require("../handlers/handleGiveaways").giveaway;
                    const giveaway = new Giveaway(row, undefined, m, bot, con);
                    const em = giveaway.makeEm(`Giveaway Started!`, `Started by: ${getStartedBy}`).addFields([
                        { name: `Prize`, value: `${giveawayPrize}`, inline: false },
                        { name: `Role(s) required`, value: `${roleNames != [] ? roleNames : "none"}`, inline: false },
                        { name: `Time left`, value: `${ms(time_left, { long: true })}`, inline: false },
                        { name: `Giveaway ID`, value: `${giveawayId}`, inline: false }
                    ]).setFooter({ text: `${giveawayWinners} winner(s)` }).setTimestamp();
                    if (m.editable) m.edit({ embeds: [em] });
                    let tm = time_left;
                    // UPDATE TIME EVERY 1 MINUTE
                    if (parseInt(tm) >= parseInt(ms("2h"))) {
                        const interv = setInterval(() => {
                            if (parseInt(tm) <= 0) return clearInterval(interv);
                            if (tm == "-0ms" || tm == "-5m") return clearInterval(interv);
                            channel.messages.fetch(row.mid).then(m => {
                                if (!m) return;
                                if (m.embeds[0].title.includes("Started")) {
                                    const em = giveaway.makeEm(`Giveaway Started!`, `Started by: ${getStartedBy}`).addFields([
                                        { name: `Prize`, value: `${giveawayPrize}`, inline: false },
                                        { name: `Role(s) required`, value: `${roleNames != [] ? roleNames : "none"}`, inline: false },
                                        { name: `Time left`, value: `${ms(parseInt(tm) - parseInt(ms("1h")))}`, inline: false },
                                        { name: `Giveaway ID`, value: `${giveawayId}`, inline: false }
                                    ]).setFooter({ text: `${giveawayWinners} winner(s)` }).setTimestamp();
                                    if (m.editable) m.edit({ embeds: [em] });
                                    tm = tm - parseInt(ms("1h"));
                                } else {
                                    clearInterval(interv);
                                }
                            }).catch((err) => {
                                if (err.message === "Unknown Message") return;
                                console.log(err);
                            });
                        }, ms("1h"));
                    } else {
                        const interv = setInterval(() => {
                            if (parseInt(tm) <= 0) return clearInterval(interv);
                            if (tm == "-0ms" || tm == "-5m") return clearInterval(interv);
                            channel.messages.fetch(row.mid).then(m => {
                                if (!m) return;
                                if (m.embeds[0].title.includes("Started")) {
                                    const em = giveaway.makeEm(`Giveaway Started!`, `Started by: ${getStartedBy}`).addFields([
                                        { name: `Prize`, value: `${giveawayPrize}`, inline: false },
                                        { name: `Role(s) required`, value: `${roleNames != [] ? roleNames : "none"}`, inline: false },
                                        { name: `Time left`, value: `${ms(parseInt(tm) - parseInt(ms("5m")))}`, inline: false },
                                        { name: `Giveaway ID`, value: `${giveawayId}`, inline: false }
                                    ]).setFooter({ text: `${giveawayWinners} winner(s)` }).setTimestamp();
                                    if (m.editable) m.edit({ embeds: [em] });
                                    tm = tm - parseInt(ms("5m"));
                                } else {
                                    clearInterval(interv);
                                }
                            }).catch((err) => {
                                if (err.message === "Unknown Message") return;
                                console.log(err);
                            });
                        }, ms("5m"));
                    }
                    // IF THERES MORE TIME LEFT CONTINUE COUNTING DOWN
                    if (time_left > 0) {
                        setTimeout(() => {
                            giveaway.end(true);
                        }, time_left);
                    } else {
                        // IF NOT END THE GIVEAWAY INSTANTLY
                        giveaway.end(true);
                    }
                }).catch((err) => {
                    if (err.message === "Unknown Message") return;
                    console.log(err);
                });
            });
        });
    },
    timedRoles: (bot, guild) => {
        con.query(`SELECT * FROM serverTimedRoles WHERE guildId="${guild.id}"`, (e, rows) => {
            if (!rows) return;
            const timeNow = new Date().getTime();
            rows.forEach(async (row) => {
                const timeLeft = parseInt(row.timeLeft) - parseInt(timeNow);
                if (timeLeft <= 0) {
                        const user = await guild.members.fetch(row.userId);
                        if (!user) return;
                        const getRole = guild.roles.cache.get(row.role);
                        if (!getRole) return;
                        user.roles.remove(getRole.id, `Timed role time is over.`);
                        con.query(`DELETE FROM serverTimedRoles WHERE guildId ="${guild.id}" AND userId = "${row.userId}"`);
                } else {
                    setTimeout(() => {
                        const user = guild.members.fetch(row.userId);
                        if (!user) return;
                        const getRole = guild.roles.cache.get(row.role);
                        if (!getRole) return;
                        user.roles.remove(getRole.id, `Timed role time is over.`);
                        con.query(`DELETE FROM serverTimedRoles WHERE guildId ="${guild.id}" AND userId = "${row.userId}"`);
                    }, timeLeft);
                }
            });
        });
    },
    redditFeed: (bot, guild) => {
        checkPosts(bot, guild, con);
    },
};