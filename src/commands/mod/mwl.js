const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'mwl',
    aliases: ["mwl"],
    description: 'Allows Staff to manage the welcome leaves system',
    usage: 'mwl',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT gc.cn, ss.modlogs, ss.modlogsChannel, gw.welcomeMessage, gw.welcomeMessageEnabled, gw.welcomeChannel, gw.leaveMessageEnabled, gw.leaveMessage, gw.leaveChannel, gw.style, gw.background FROM casenumber AS gc LEFT JOIN serverSettings AS ss ON ss.guildId = gc.guildId LEFT JOIN guildWl AS gw ON gw.guildId = gc.guildId WHERE gc.guildId ="${message.guild.id}"`, async (e, row) => {
            if (e) return console.error(e.stack);
            row = row[0];
            con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
                const checkRank = staffMembers != undefined ? staffMembers.length : 0;
                if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
                con.query(`SELECT welcomeMessage FROM guildWl WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                    if (row.length == 0) {
                        con.query(`INSERT INTO guildWl (guildId, welcomeMessageEnabled, welcomeMessage, welcomeChannel, leaveMessageEnabled, leaveMessage, leaveChannel, style, background) VALUES (?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, "false", "Hello %NAME%. Welcome to %GUILDNAME%!", "none", "false", "Goodbye %NAME%. %NAME% left the guild.", "none", "image", "default"]);
                    }
                });

                const IH = require("../../handlers/interactions").IH;

                const ih = new IH(message);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction("Manage welcome messages", ButtonStyle.Primary, state, "welcome");

                    ih.makeNewButtonInteraction("Manage leave messages", ButtonStyle.Primary, state, "leave");

                    const row = ih.return_row();

                    return [row];
                };

                const status = ["**Waiting for input..**"];

                const generate_description = (wMe, wMc, wMm, wMs, wMb, lMe, lMc, lMm, status) => {
                    return `__**WELCOME MESSAGES**__\n**Enabled:** __${wMe}__\n**Channel:** __${wMc}__\n**Message:** __${wMm}__\n\n__**LEAVE MESSAGES**__\n**Enabled:** __${lMe}__\n**Channel:** __${lMc}__\n**Message:** __${lMm}__\n\n__**General Settings**__\n**Style:**__${wMs}__\n**Background**:__${wMb}__\n\n__**STATUS**__\n${status.join("\n")}`;
                };

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                const init = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const filter = m => m.author.id === message.author.id;

                const on_collect = (Interaction, collector) => {
                    collector.stop("artificial");

                    if (Interaction.customId == "welcome") {

                        con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {

                            row = row[0];

                            status.push("**Managing welcome messages..**");

                            const components = (state) => {
                                ih.create_row();

                                ih.makeNewButtonInteraction("Toggle", ButtonStyle.Primary, state, "toggle");

                                ih.makeNewButtonInteraction("Change channel", ButtonStyle.Primary, state, "channel");

                                ih.makeNewButtonInteraction("Change message", ButtonStyle.Primary, state, "message");

                                ih.makeNewButtonInteraction("Change style", ButtonStyle.Primary, state, "style");

                                ih.makeNewButtonInteraction("Change background", ButtonStyle.Primary, state, "background");

                                const row = ih.return_row();

                                return [row];
                            };

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                            Interaction.update({
                                components: components(false),
                                embeds: [embed]
                            });

                            let counter = 0;

                            const on_collect = (Interaction, collector) => {
                                con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {
                                    row = row[0];
                                    if (Interaction.customId == "toggle") {

                                        if (counter >= 5) return collector.stop();

                                        const current_value = row.welcomeMessageEnabled;
                                        const opposite_value = current_value == "true" ? "false" : "true";

                                        con.query(`UPDATE guildWl SET welcomeMessageEnabled="${opposite_value}" WHERE guildId="${message.guild.id}"`);

                                        status.push(`**Set welcome messages enabled to ${opposite_value}**`);

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(generate_description(opposite_value, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));


                                        Interaction.update({
                                            embeds: [embed]
                                        });

                                        counter++;
                                    } else if (Interaction.customId == "channel") {
                                        con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {
                                            row = row[0];

                                            collector.stop("artificial");

                                            status.push("**:warning: Waiting for you to select a channel. :warning:**");

                                            const components = (state) => {
                                                ih.create_row();

                                                const opts = message.guild.channels.cache.map(x => {
                                                    return {
                                                        label: x.name,
                                                        value: x.name,
                                                        emoji: "➡️"
                                                    };
                                                });

                                                ih.makeNewSelectInteraction("channel-select", "Select a channel...", state, opts);

                                                const row = ih.return_row();

                                                return [row];
                                            };

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                            Interaction.update({
                                                embeds: [embed],
                                                components: components(false)
                                            });

                                            const on_collect = (Interaction, collector) => {
                                                collector.stop("artificial");

                                                const selected = Interaction.values[0];

                                                status.push(`**:white_check_mark: Updated welcome channel to ${selected}. :white_check_mark:**`);

                                                con.query(`UPDATE guildWl SET welcomeChannel="${selected}" WHERE guildId="${message.guild.id}"`);

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(generate_description(row.welcomeMessageEnabled, selected, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                                Interaction.update({
                                                    embeds: [embed],
                                                    components: []
                                                });
                                            };

                                            const on_end = reason => {
                                                if (reason == "artificial") return;
                                                if (init.editable) init.edit({ components: components(true) });
                                            };

                                            ih.create_collector(on_collect, on_end, init);
                                        });
                                    } else if (Interaction.customId == "style") {
                                            if (counter >= 5) return collector.stop();

                                            const current_value = row.style;
                                            const opposite_value = current_value == "text" ? "image" : "text";

                                            con.query(`UPDATE guildWl SET style="${opposite_value}" WHERE guildId="${message.guild.id}"`);

                                            status.push(`**Set style to ${opposite_value}**`);

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_description(opposite_value, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));


                                            Interaction.update({
                                                embeds: [embed]
                                            });

                                            counter++;
                                    } else if (Interaction.customId == "background") {
                                        con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {
                                            row = row[0];

                                            collector.stop("artificial");

                                            status.push("**:warning: Waiting for you to select a background.. :warning:**");

                                            const components = (state) => {
                                                ih.create_row();

                                                const validBackgrounds = ['default', 'fade', 'space', 'blossom', 'neon', 'leaves', 'samurai', 'eclipse', 'binary'];

                                                const opts = validBackgrounds.map(x => {
                                                    return {
                                                        label: x,
                                                        value: x
                                                    };
                                                });

                                                ih.makeNewSelectInteraction("background-select", "Select a background...", state, opts);

                                                const row = ih.return_row();

                                                return [row];
                                            };

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                            Interaction.update({
                                                embeds: [embed],
                                                components: components(false)
                                            });

                                            const on_collect = (Interaction, collector) => {
                                                collector.stop("artificial");

                                                const selected = Interaction.values[0];

                                                status.push(`**:white_check_mark: Updated background to ${selected}. :white_check_mark:**`);

                                                con.query(`UPDATE guildWl SET background="${selected}" WHERE guildId="${message.guild.id}"`);

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, selected, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                                Interaction.update({
                                                    embeds: [embed],
                                                    components: []
                                                });
                                            };

                                            const on_end = reason => {
                                                if (reason == "artificial") return;
                                                if (init.editable) init.edit({ components: components(true) });
                                            };

                                            ih.create_collector(on_collect, on_end, init);
                                        });
                                    } else {
                                        con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {
                                            row = row[0];

                                            collector.stop("artificial");

                                            status.push("**:warning: Waiting for you to enter a message.. :warning:**");

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                            Interaction.update({
                                                embeds: [embed],
                                                components: []
                                            });

                                            message.channel.awaitMessages({
                                                filter,
                                                time: 60000,
                                                max: 1
                                            }).then(resp => {
                                                resp = resp.first();

                                                const check = resp.content.replace(/[^\x00-\x7F]/g, "");
                                                if (check.length < 1) return mainFuncs.send(message, "Welcome message can't have ASCII characters.");

                                                if (resp.content.length > 500) return mainFuncs.send(message, "Welcome message can't be longer than 500 characters.");

                                                con.query(`UPDATE guildWl SET welcomeMessage="${resp.content}" WHERE guildId="${message.guild.id}"`);

                                                status.push("**:white_check_mark: Successfully updated welcome message. :white_check_mark:**");

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, resp.content, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                                if (init.editable) init.edit({ embeds: [embed] });
                                            }).catch(() => {
                                                const embed1 = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`**You ran out of time.**`);

                                                if (init.editable) init.edit({ embeds: [embed1] });
                                            });
                                        });
                                    }
                                });
                            };

                            const on_end = reason => {
                                if (reason == "artificial") return;
                                if (init.editable) init.edit({ components: components(true) });
                            };

                            ih.create_collector(on_collect, on_end, init);
                        });
                    } else {
                        con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {

                            row = row[0];

                            status.push("**Managing leave messages..**");

                            const components = (state) => {
                                ih.create_row();

                                ih.makeNewButtonInteraction("Toggle", ButtonStyle.Primary, state, "toggle");

                                ih.makeNewButtonInteraction("Change channel", ButtonStyle.Primary, state, "channel");

                                ih.makeNewButtonInteraction("Change message", ButtonStyle.Primary, state, "message");

                                const row = ih.return_row();

                                return [row];
                            };

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                            Interaction.update({
                                components: components(false),
                                embeds: [embed]
                            });

                            let counter = 0;

                            const on_collect = (Interaction, collector) => {
                                con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {
                                    row = row[0];
                                    if (Interaction.customId == "toggle") {

                                        if (counter >= 5) return collector.stop();

                                        const current_value = row.leaveMessageEnabled;
                                        const opposite_value = current_value == "true" ? "false" : "true";

                                        con.query(`UPDATE guildWl SET leaveMessageEnabled="${opposite_value}" WHERE guildId="${message.guild.id}"`);

                                        status.push(`**Set leave messages enabled to ${opposite_value}**`);

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, opposite_value, row.leaveChannel, row.leaveMessage, status));


                                        Interaction.update({
                                            embeds: [embed]
                                        });

                                        counter++;
                                    } else if (Interaction.customId == "channel") {
                                        con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {
                                            row = row[0];

                                            collector.stop("artificial");

                                            status.push("**:warning: Waiting for you to select a channel.. :warning:**");

                                            const components = (state) => {
                                                ih.create_row();

                                                const opts = message.guild.channels.cache.map(x => {
                                                    return {
                                                        label: x.name,
                                                        value: x.name,
                                                        emoji: "➡️"
                                                    };
                                                });

                                                ih.makeNewSelectInteraction("channel-select", "Select a channel...", state, opts);

                                                const row = ih.return_row();

                                                return [row];
                                            };

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                            Interaction.update({
                                                embeds: [embed],
                                                components: components(false)
                                            });

                                            const on_collect = (Interaction, collector) => {
                                                collector.stop("artificial");

                                                const selected = Interaction.values[0];

                                                status.push(`**:white_check_mark: Updated leave channel to ${selected}. :white_check_mark:**`);

                                                con.query(`UPDATE guildWl SET leaveChannel="${selected}" WHERE guildId="${message.guild.id}"`);

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, selected, row.leaveMessage, status));

                                                Interaction.update({
                                                    embeds: [embed],
                                                    components: []
                                                });
                                            };

                                            const on_end = reason => {
                                                if (reason == "artificial") return;
                                                if (init.editable) init.edit({ components: components(true) });
                                            };

                                            ih.create_collector(on_collect, on_end, init);
                                        });
                                    } else {
                                        con.query(`SELECT welcomeMessage, welcomeMessageEnabled, welcomeChannel, leaveChannel, leaveMessageEnabled, leaveMessage, style, background FROM guildWl WHERE guildId='${message.guild.id}'`, (e, row) => {
                                            row = row[0];

                                            collector.stop("artificial");

                                            status.push("**:warning: Waiting for you to enter a message.. :warning:**");

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, row.leaveMessage, status));

                                            Interaction.update({
                                                embeds: [embed],
                                                components: []
                                            });

                                            message.channel.awaitMessages({
                                                filter,
                                                time: 60000,
                                                max: 1
                                            }).then(resp => {
                                                resp = resp.first();

                                                const check = resp.content.replace(/[^\x00-\x7F]/g, "");
                                                if (check.length < 1) return mainFuncs.send(message, "Leave message can't have ASCII characters.");

                                                if (resp.content.length > 500) return mainFuncs.send(message, "Leave message can't be longer than 500 characters.");

                                                con.query(`UPDATE guildWl SET leaveMessage="${resp.content}" WHERE guildId="${message.guild.id}"`);

                                                status.push("**:white_check_mark: Successfully updated leave message. :white_check_mark:**");

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(generate_description(row.welcomeMessageEnabled, row.welcomeChannel, row.welcomeMessage, row.style, row.background, row.leaveMessageEnabled, row.leaveChannel, resp.content, status));

                                                if (init.editable) init.edit({ embeds: [embed] });
                                            }).catch(() => {
                                                const embed1 = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`**You ran out of time.**`);

                                                if (init.editable) init.edit({ embeds: [embed1] });
                                            });
                                        });
                                    }
                                });
                            };

                            const on_end = reason => {
                                if (reason == "artificial") return;
                                if (init.editable) init.edit({ components: components(true) });
                            };

                            ih.create_collector(on_collect, on_end, init);
                        });
                    }
                };

                const on_end = reason => {
                    if (reason == "artificial") return;
                    if (init.editable) init.edit({ components: components(true) });
                };

                ih.create_collector(on_collect, on_end, init);
            });
        });
    }
};