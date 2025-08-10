const { EmbedBuilder, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'profilesettings',
    aliases: ["pfstg"],
    description: 'Allows users to costomize their profile',
    usage: 'profilesettings',
    cooldownTime: '1',
    group: 'leveling',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT serverLevels, ServerCash FROM serverSettings WHERE guildId ="${message.guild.id}" LIMIT 1`, (e, row) => {
            if (row.serverLevels === 'no') return mainFuncs.send(message, 'Levels need to be turned on to be able to use profiles');
            con.query(`SELECT * FROM serverLevels WHERE guildId ="${message.guild.id}" AND userId ="${message.author.id}"`, async (e, row) => {
                if (row.length === 0) return mainFuncs.send(message, 'Need to talk for a bit to build up a profile');
                con.query(`SELECT * FROM profileSettings WHERE guildId ="${message.guild.id}" AND userId ="${message.author.id}"`, async (e, pfStg) => {
                    if (!pfStg || pfStg.length === 0) {
                        con.promise().query(`INSERT INTO profileSettings (guildId, userId, textColor, background, font, fontSyle, bckgColor) VALUES (?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, message.author.id, "#FFFFFF", "default", "default", "default", "#212121"]);
                    }

                    pfStg = pfStg[0];

                    const IH = require("../../handlers/interactions").IH;

                    const ih = new IH(message);

                    const components = (state) => {
                        ih.create_row();

                        ih.makeNewButtonInteraction("Change color", ButtonStyle.Primary, state, "txtColor");

                        ih.makeNewButtonInteraction("Change font", ButtonStyle.Primary, state, "txtFont");

                        ih.makeNewButtonInteraction("Change font style", ButtonStyle.Primary, state, "txtStyle");

                        ih.makeNewButtonInteraction("change background", ButtonStyle.Primary, state,"background");

                        ih.makeNewButtonInteraction("change background color", ButtonStyle.Primary, state,"bckgColor");

                        const row = ih.return_row();

                        return [row];
                    };

                    const status = ["**Waiting for input..**"];

                    const generate_description = (pFc, pFf, pFs, pFb, pFbc, status) => {
                        return `__**Profile Settings**__\n\n**Text color:** __${pFc}__\n**Font:** __${pFf}__\n**Font style:** __${pFs}__\n**Background:** __${pFb}__\n**Background Color:** __${pFbc}__\n\n__**STATUS**__\n${status.join("\n")}`;
                    };

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

                    const init = await message.channel.send({
                        embeds: [embed],
                        components: components(false)
                    });

                    const filter = m => m.author.id === message.author.id;

                    const on_collect = (Interaction, collector) => {
                        collector.stop("artificial");

                        if (Interaction.customId == "txtColor") {
                            collector.stop("artificial");

                            status.push("**:warning: Waiting for you to enter a message.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

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
                                if (check.length < 1) return mainFuncs.send(message, "Input can't have ASCII characters.");

                                if (!resp.content.startsWith("#")) return mainFuncs.send(message, "Enter hex codes only (Ex: #FFFFFF)");
                                if (resp.content.length > 7) return mainFuncs.send(message, "Enter hex codes only (Ex: #FFFFFF)");

                                con.query(`UPDATE profileSettings SET textColor=${con.escape(resp.content)} WHERE guildId="${message.guild.id}" AND userId="${message.author.id}"`);

                                status.push("**:white_check_mark: Successfully updated text color. :white_check_mark:**");

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

                                if (init.editable) init.edit({ embeds: [embed] });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);

                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "txtFont") {
                            collector.stop("artificial");

                            status.push("**:warning: Waiting for you to select a font.. :warning:**");

                            const components = (state) => {
                                ih.create_row();

                                const validFonts = ['default', 'Verdana', 'Times New Roman', 'Courier New', 'serif', 'sans-serif'];

                                const opts = validFonts.map(x => {
                                    return {
                                        label: x,
                                        value: x
                                    };
                                });

                                ih.makeNewSelectInteraction("font-select", "Select a font...", state, opts);

                                const row = ih.return_row();

                                return [row];
                            };

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const on_collect = (Interaction, collector) => {
                                collector.stop("artificial");

                                const selected = Interaction.values[0];

                                status.push(`**:white_check_mark: Updated font to ${selected}. :white_check_mark:**`);

                                con.query(`UPDATE profileSettings SET font="${selected}" WHERE guildId="${message.guild.id}" AND userId="${message.author.id}"`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_description(pfStg.textColor, selected, pfStg.fontStle, pfStg.background, pfStg.bckgColor, status));

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
                        } else if (Interaction.customId == "txtStyle") {
                            collector.stop("artificial");

                            status.push("**:warning: Waiting for you to select a text style.. :warning:**");

                            const components = (state) => {
                                ih.create_row();

                                const validStyles = ['default', 'italic', 'oblique'];

                                const opts = validStyles.map(x => {
                                    return {
                                        label: x,
                                        value: x
                                    };
                                });

                                ih.makeNewSelectInteraction("style-select", "Select a text style...", state, opts);

                                const row = ih.return_row();

                                return [row];
                            };

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const on_collect = (Interaction, collector) => {
                                collector.stop("artificial");

                                const selected = Interaction.values[0];

                                status.push(`**:white_check_mark: Updated text style to ${selected}. :white_check_mark:**`);

                                con.query(`UPDATE profileSettings SET fontStyle="${selected}" WHERE guildId="${message.guild.id}" AND userId="${message.author.id}"`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_description(pfStg.textColor, pfStg.font, selected, pfStg.background, pfStg.bckgColor, status));

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
                        } else if (Interaction.customId == "background") {
                            collector.stop("artificial");

                            status.push("**:warning: Waiting for you to select a background.. :warning:**");

                            const components = (state) => {
                                ih.create_row();

                                const validBackgrounds = ['default', 'fade', 'space', 'blossom', 'leaves', 'samurai', 'eclipse', 'binary', 'neon'];

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
                                .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            const on_collect = (Interaction, collector) => {
                                collector.stop("artificial");

                                const selected = Interaction.values[0];

                                status.push(`**:white_check_mark: Updated background to ${selected}. :white_check_mark:**`);

                                con.query(`UPDATE profileSettings SET background="${selected}" WHERE guildId="${message.guild.id}" AND userId="${message.author.id}"`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, selected, pfStg.bckgColor, status));

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
                        } else if (Interaction.customId == "bckgColor") {
                            collector.stop("artificial");

                            status.push("**:warning: Waiting for you to enter a hex code.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

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
                                if (check.length < 1) return mainFuncs.send(message, "Input can't have ASCII characters.");

                                if (!resp.content.startsWith("#")) return mainFuncs.send(message, "Enter hex codes only (Ex: #FFFFFF)");
                                if (resp.content.length > 7) return mainFuncs.send(message, "Enter hex codes only (Ex: #FFFFFF)");

                                con.query(`UPDATE profileSettings SET bckgColor=${con.escape(resp.content)} WHERE guildId="${message.guild.id}" AND userId="${message.author.id}"`);

                                status.push("**:white_check_mark: Successfully updated background color. :white_check_mark:**");

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_description(pfStg.textColor, pfStg.font, pfStg.fontStyle, pfStg.background, pfStg.bckgColor, status));

                                if (init.editable) init.edit({ embeds: [embed] });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);

                                if (init.editable) init.edit({ embeds: [embed1] });
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
        });
    }
};