const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const Monitor = require("../../handlers/handleTwitch");
let monitors = require("../../handlers/handleTwitch").monitors;
const ms = require("ms");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'managetwitch',
    aliases: ["mngt"],
    description: 'Manage twitch notifications',
    usage: 'mngt',
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

            con.query(`SELECT * FROM serverTwitch WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                rows = rows[0];
                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`__**TWITCH**__\n\n**The bot will send alerts for:** __${rows.username}__\n**Channel where the alerts will be sent:** __${idToCh(rows.channel)}__\n\n__**STATUS**__\n${status.join("\n")}`);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction(`Change twitch channel`, ButtonStyle.Primary, state, `twitch`);

                    ih.makeNewButtonInteraction(`Change channel for alerts`, ButtonStyle.Primary, state, `channel`);

                    ih.makeNewButtonInteraction(`Change custom message`, ButtonStyle.Primary, state, `message`);

                    ih.makeNewButtonInteraction(rows.receivingAlerts == "no" ? `Start receiving alerts` : `Start receiving alerts (already receiving)`, ButtonStyle.Primary, state || rows.receivingAlerts == "yes" || (rows.username == "not set" && !username) || (rows.channel == "not set" && !channel), `start`, "✅");

                    if (rows.receivingAlerts == "yes") {
                        ih.makeNewButtonInteraction(`Stop receiving alerts for ${rows.username}`, ButtonStyle.Danger, state, `stop`);
                    }

                    return [ih.return_row()];
                };

                const init = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const filter = m => m.author.id === message.author.id;

                const on_collect = (Interaction, collector) => {
                    con.query(`SELECT * FROM serverTwitch WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                        rows = rows[0];

                        if (Interaction.customId == "twitch") {
                            status.push(`**Waiting for you to enter username..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**TWITCH**__\n\n**Curent channel the bot will send alerts for:** __${rows.username}__\n**Channel where the alerts will be sent:** __${idToCh(rows.channel)}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;

                                con.query(`UPDATE serverTwitch SET username="${resp}" WHERE guildId="${message.guild.id}"`);

                                username = resp;

                                status.push(`**Username updated.**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**TWITCH**__\n\n**Curent channel the bot will send alerts for:** __${resp}__\n**Channel where the alerts will be sent:** __${idToCh(rows.channel)}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "start") {

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**Validating username..**`);

                            await Interaction.update({
                                components: [],
                                embeds: [embed]
                            });

                            const ch = channel == undefined ? idToCh(rows.channel) : channel;
                            const un = username == undefined ? rows.username : username;

                            const monitor = new Monitor(un, message.guild.id, con);

                            const result = await monitor.start();

                            if (result && result == "INVALID") return mainFuncs.send(message, "That is not a valid username.");

                            const embed1 = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**Now receiving alerts for ${username == undefined ? rows.username : username} in ${channel == undefined ? idToCh(rows.channel) : channel}.**`);

                            if (init.editable) init.edit({ components: [], embeds: [embed1] });

                            con.query(`UPDATE serverTwitch SET receivingAlerts="yes" WHERE guildId="${message.guild.id}"`);

                            monitor.onLive(async (data, user) => {

                                const difference = ms(await monitor.calcDiffDates(), { long: true });

                                const TITLE = parseInt(ms(difference)) > parseInt(ms("2m")) ? `${un} went live ${difference} ago! ` : `${un} just went live!`;

                                const embed = new EmbedBuilder()
                                    .setTitle(TITLE)
                                    .setTimestamp(data.startDate)
                                    .setAuthor({ name: "TwitchTV", iconURL: "https://img.utdstc.com/icon/c28/b9e/c28b9efbfb9482de979459bc95d9951e18ee05228dab49c6dac9b70ee800c9c6:200" })
                                    .setColor(0x8A2BE2)
                                    .addFields([
                                        { name: "Viewers", value: `${data.viewers.toString()}`, inline: true },
                                        { name: "Game", value: `${data.gameName}`, inline: true },
                                        { name: "Title", value: `${data.title}`, inline: true }
                                    ])
                                    .setThumbnail(user.profilePictureUrl)
                                    .setImage(data.getThumbnailUrl(500, 300));

                                const IH = require("../../handlers/interactions").IH;

                                const ih = new IH(undefined);

                                const components = () => {
                                    ih.create_row();

                                    ih.makeNewButtonInteraction(`Live here`, ButtonStyle.Link, false, undefined, undefined, `https://twitch.tv/${un}`);

                                    return [ih.return_row()];
                                };

                                ch.send({ embeds: [embed], components: components() });
                            });
                        } else if (Interaction.customId == "stop") {
                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**You will no longer receive alerts from ${rows.username}.**`);

                            Interaction.update({
                                components: [],
                                embeds: [embed]
                            });

                            //console.log(monitors);

                            monitors.forEach(m => m.stop());

                            monitors = [];

                            con.query(`UPDATE serverTwitch SET receivingAlerts="no" WHERE guildId="${message.guild.id}"`);

                            const client = require("../../handlers/handleTwitch").client;

                            const uid = (await client.helix.users.getUserByName(rows.username)).id;

                            con.query(`DELETE FROM streams WHERE userId="${uid}"`);
                        } else if (Interaction.customId == "message") {
                            status.push(`**Waiting for you to enter a message..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**TWITCH**__\n\n**Curent channel the bot will send alerts for:** __${rows.username}__\n**Channel where the alerts will be sent:** __${idToCh(rows.channel)}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first();
                                if (resp.attachments.size > 0) return mainFuncs.send(message, "**An image can't be set as the message.**", 10000);
                                con.query(`UPDATE serverTwitch SET messageContent="${resp.content}" WHERE guildId="${message.guild.id}"`);

                                status.push(`**Custom message updated.**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**TWITCH**__\n\n**Curent channel the bot will send alerts for:** __${rows.username}__\n**Channel where the alerts will be sent:** __${idToCh(rows.channel)}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else {
                            status.push(`**Waiting for you to enter channel name..**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**TWITCH**__\n\n**Curent channel the bot will send alerts for:** __${rows.username}__\n**Channel where the alerts will be sent:** __${idToCh(rows.channel)}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;

                                const ch = message.guild.channels.cache.find(c => c.name == resp);

                                if (!ch) return mainFuncs.send(message, "Not a valid channel.");

                                con.query(`UPDATE serverTwitch SET channel="${ch.id}" WHERE guildId="${message.guild.id}"`);

                                status.push(`**Channel updated.**`);

                                channel = ch;

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**TWITCH**__\n\n**Curent channel the bot will send alerts for:** __${rows.username}__\n**Channel where the alerts will be sent:** __${ch}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
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