const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const request = require("node-superfetch");
const modFuncs = require("../../functions/modFuncs");
const { checkPosts } = require("../../handlers/handleReddit");
module.exports = {
    name: 'managereddit',
    aliases: ["mngr"],
    description: 'Manage reddit feed',
    usage: 'mngr',
    cooldownTime: '1',
    group: 'mod',

    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {

        const idToCh = (id) => {
            if (id == "not set") return "not set";
            return message.guild.channels.cache.get(id);
        };

        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const status = ["**Waiting for input..**"];

            let username, channel;

            con.query(`SELECT * FROM serverReddit WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                if (rows.length == 0) return con.promise().query(`INSERT INTO serverReddit (guildId, recieveFeed, subReddit, feedChannel, lastPost) VALUES (?, ?, ?, ?, ?)`, [message.guild.id, "off", "none", "none", "none"]);
                rows = rows[0];
                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`__**Reddit**__\n\n**The bot will send feed from:** __r/${rows.subReddit}__\n**Channel where the feed will be sent:** __${rows.feedChannel != 'none' ? idToCh(rows.feedChannel) : 'none'}__\n**On/off:** __${rows.recieveFeed}__\n\n__**STATUS**__\n${status.join("\n")}`);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction(`Change subreddit`, ButtonStyle.Primary, state, `subSwitch`);

                    ih.makeNewButtonInteraction(`Feed channel`, ButtonStyle.Primary, state, `switchChannel`);

                    ih.makeNewButtonInteraction(`On/off`, ButtonStyle.Primary, state, `onoff`);

                    return [ih.return_row()];
                };

                const init = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const filter = m => m.author.id === message.author.id;

                const on_collect = (Interaction, collector) => {
                    con.query(`SELECT * FROM serverReddit WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                        rows = rows[0];

                        if (Interaction.customId == "subSwitch") {
                            status.push(`**Waiting for you to enter a subreddit..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**Reddit**__\n\n**The bot will send feed from:** __r/${rows.subReddit}__\n**Channel where the feed will be sent:** __${idToCh(rows.feedChannel)}__\n**On/off:** __${rows.recieveFeed}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(async resp => {
                                resp = resp.first().content;

                                const { body } = await request
                                    .get(`https://www.reddit.com/r/${resp.replace('r/', '')}/new.json?limit=3`);
                                if (!body) return message.channel.send(`**Subreddit wasn't found, please try again.**`);
                                const posts = body.data.children.filter(post => !post.data.over_18);
                                if (posts.length == 0) return message.channel.send(`**NSFW subreddits are not allowed.**`);

                                con.query(`UPDATE serverReddit SET subReddit=${con.escape(resp.replace('r/', ''))} WHERE guildId="${message.guild.id}"`);

                                username = resp;

                                status.push(`**Subreddit updated.**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**Reddit**__\n\n**The bot will send feed from:** __r/${resp}__\n**Channel where the feed will be sent:** __${idToCh(rows.feedChannel)}__\n**On/off:** __${rows.recieveFeed}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "switchChannel") {
                            status.push(`**Waiting for you to enter a channel name..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**Reddit**__\n\n**The bot will send feed from:** __r/${rows.subReddit}__\n**Channel where the feed will be sent:** __${idToCh(rows.feedChannel)}__\n**On/off:** __${rows.recieveFeed}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;

                                const channel = message.guild.channels.cache.find(ch => ch.name === resp);
                                if (!channel) {
                                    status.push(`**Couldn't find channel, please try again.**`);
                                } else {
                                    con.query(`UPDATE serverReddit SET feedChannel="${channel.id}" WHERE guildId="${message.guild.id}"`);

                                    status.push(`**Channel updated.**`);
                                }

                                username = resp;


                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**Reddit**__\n\n**The bot will send feed from:** __r/${rows.subReddit}__\n**Channel where the feed will be sent:** __${resp}__\n**On/off:** __${rows.recieveFeed}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "onoff") {
                            con.query(`SELECT * FROM serverReddit WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                row = row[0];

                                const current_value = row.recieveFeed;
                                const opposite_value = current_value == "on" ? "off" : "on";

                                con.promise().query(`UPDATE serverReddit SET recieveFeed="${opposite_value}" WHERE guildId="${message.guild.id}"`);

                                if (opposite_value == "on") {
                                    checkPosts(bot, message.guild, con);
                                }

                                status.push(`**Reddit feed has been turned ${opposite_value} in this server.**`);

                                //collector.stop("artificial");

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**Reddit**__\n\n**The bot will send feed from:** __r/${rows.subReddit}__\n**Channel where the feed will be sent:** __${idToCh(rows.feedChannel)}__\n**On/off:** __${opposite_value}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                Interaction.update({
                                    embeds: [embed]
                                });
                            });
                        }
                    });
                };

                const on_end = reason => {
                    if (reason == 'artificial') return;
                    if (init.editable) init.edit({ components: components(true) });
                };

                ih.create_collector(on_collect, on_end, init);
            });
        });
    }
};