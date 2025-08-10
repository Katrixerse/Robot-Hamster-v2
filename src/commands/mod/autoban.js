const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'autoban',
    aliases: ["ab"],
    description: 'Manage autoban',
    usage: 'autoban',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.BanMembers],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            con.query(`SELECT * FROM serverAutoban WHERE guildId="${message.guild.id}"`, async (e, rows) => {

                rows = rows[0];

                const IH = require("../../handlers/interactions").IH;

                const ih = new IH(message);

                const status = ["**Waiting for input...**"];

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:** __${rows.day}__\n\n__**DATES**__ \n**Ban if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction("Manage days", ButtonStyle.Primary, state, "days", "📖");

                    ih.makeNewButtonInteraction("Manage dates", ButtonStyle.Primary, state,  "dates", "📅");

                    ih.makeNewButtonInteraction("Manage matching strings", ButtonStyle.Primary, state, "strings", "📜");

                    ih.makeNewButtonInteraction("Manage invites", ButtonStyle.Primary, state, "invites", "📑");

                    const row = ih.return_row();

                    return [row];
                };

                const init = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const on_collect = (Interaction, collector) => {
                    if (Interaction.customId == "dates") {
                        status.push("**Managing dates...**");

                        collector.stop("artificial");

                        const components = (state) => {
                            ih.create_row();

                            ih.makeNewButtonInteraction("Toggle dates", ButtonStyle.Primary, state, "toggle");

                            ih.makeNewButtonInteraction("Change the date", ButtonStyle.Primary, state, "change");

                            const row = ih.return_row();

                            return [row];
                        };

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                        Interaction.update({
                            components: components(false),
                            embeds: [embed]
                        });

                        let counter = 0;

                        const on_collect = (Interaction, collector) => {
                            con.query(`SELECT * FROM serverAutoban WHERE guildId="${message.guild.id}"`, async (e, rows) => {

                                rows = rows[0];

                                if (Interaction.customId == "toggle") {
                                    if (counter >= 5) {
                                        return collector.stop();
                                    }

                                    const action = rows.dates == "enabled" ? "disabled" : "enabled";
                                    const format = action.charAt(0).toUpperCase() + action.slice(1);
                                    status.push(`**${format} dates.**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${action}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    Interaction.update({
                                        embeds: [embed]
                                    });

                                    con.query(`UPDATE serverAutoban SET dates="${action}" WHERE guildId="${message.guild.id}"`);

                                    counter++;
                                } else {

                                    collector.stop("artificial");

                                    status.push(`**:warning: Waiting for you to enter a date... (D/M/YYYY) (example: 5/7/2021) :warning:**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    Interaction.update({
                                        components: [],
                                        embeds: [embed]
                                    });

                                    const filter = m => m.author.id === message.author.id;

                                    message.channel.awaitMessages({
                                        filter,
                                        time: 60000,
                                        max: 1
                                    }).then(resp => {

                                        resp = resp.first();

                                        const dateAndTime = require("date-and-time");

                                        const date = dateAndTime.parse(resp.content, "D/M/YYYY");

                                        if (date.toDateString() == "Invalid Date") {
                                            collector.stop("artificial");
                                            return mainFuncs.send(message, "Invalid date.");
                                        }

                                        con.query(`UPDATE serverAutoban SET date="${resp.content}" WHERE guildId="${message.guild.id}"`);

                                        status.push("**Date changed.**");

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${resp.content}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                        if (init.editable) init.edit({ embeds: [embed] });

                                        collector.stop("artificial");

                                    }).catch((err) => {

                                        console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**You ran out of time.**`);

                                        if (init.editable) init.edit({ embeds: [embed] });
                                    });
                                }
                            });
                        };

                        const on_end = reason => {
                            if (reason == "artificial") return;
                            if (init.editable) init.edit({ components: components(true) });
                        };

                        ih.create_collector(on_collect, on_end, init);
                    } else if (Interaction.customId == "strings") {
                        status.push("**Managing strings...**");

                        collector.stop("artificial");

                        const components = (state) => {
                            ih.create_row();

                            ih.makeNewButtonInteraction("Toggle strings", ButtonStyle.Primary, state, "toggle");

                            ih.makeNewButtonInteraction("Change the string", ButtonStyle.Primary, state, "change");

                            const row = ih.return_row();

                            return [row];
                        };

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                        Interaction.update({
                            components: components(false),
                            embeds: [embed]
                        });

                        let counter = 0;

                        const on_collect = (Interaction, collector) => {
                            con.query(`SELECT * FROM serverAutoban WHERE guildId="${message.guild.id}"`, async (e, rows) => {

                                rows = rows[0];

                                if (Interaction.customId == "toggle") {
                                    if (counter >= 5) {
                                        return collector.stop();
                                    }

                                    const action = rows.strings == "enabled" ? "disabled" : "enabled";
                                    const format = action.charAt(0).toUpperCase() + action.slice(1);
                                    status.push(`**${format} strings.**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${action}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    Interaction.update({
                                        embeds: [embed]
                                    });

                                    con.query(`UPDATE serverAutoban SET strings="${action}" WHERE guildId="${message.guild.id}"`);

                                    counter++;
                                } else {

                                    collector.stop("artificial");

                                    status.push(`**:warning: Waiting for you to enter a string... (cannot exceed 32 characters):warning:**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:** __not set__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    Interaction.update({
                                        components: [],
                                        embeds: [embed]
                                    });

                                    const filter = m => m.author.id === message.author.id;

                                    message.channel.awaitMessages({
                                        filter,
                                        time: 60000,
                                        max: 1
                                    }).then(resp => {

                                        resp = resp.first();

                                        const string = resp.content;

                                        if (string.length > 32) {
                                            collector.stop("artificial");
                                            return mainFuncs.send(message, "Invalid string.");
                                        }

                                        con.query(`UPDATE serverAutoban SET string="${resp.content}" WHERE guildId="${message.guild.id}"`);

                                        status.push("**String changed.**");

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${resp.content}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                        if (init.editable) init.edit({ embeds: [embed] });

                                        collector.stop("artificial");

                                    }).catch((err) => {

                                        console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**You ran out of time.**`);

                                        if (init.editable) init.edit({ embeds: [embed] });
                                    });
                                }
                            });
                        };

                        const on_end = reason => {
                            if (reason == "artificial") return;
                            if (init.editable) init.edit({ components: components(true) });
                        };

                        ih.create_collector(on_collect, on_end, init);
                    } else if (Interaction.customId == "invites") {
                        status.push("**Managing invites...**");

                        collector.stop("artificial");

                        const components = (state) => {
                            ih.create_row();

                            ih.makeNewButtonInteraction("Toggle invites", ButtonStyle.Primary, state, "toggle");

                            const row = ih.return_row();

                            return [row];
                        };

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:** __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                        Interaction.update({
                            components: components(false),
                            embeds: [embed]
                        });

                        let counter = 0;

                        const on_collect = (Interaction, collector) => {
                            con.query(`SELECT * FROM serverAutoban WHERE guildId="${message.guild.id}"`, async (e, rows) => {

                                rows = rows[0];

                                if (Interaction.customId == "toggle") {
                                    if (counter >= 5) {
                                        return collector.stop();
                                    }

                                    const action = rows.invites == "enabled" ? "disabled" : "enabled";
                                    const format = action.charAt(0).toUpperCase() + action.slice(1);
                                    status.push(`**${format} invites.**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${action}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    Interaction.update({
                                        embeds: [embed]
                                    });

                                    con.query(`UPDATE serverAutoban SET invites="${action}" WHERE guildId="${message.guild.id}"`);

                                    counter++;
                                }
                            });
                        };

                        const on_end = reason => {
                            if (reason == "artificial") return;
                            if (init.editable) init.edit({ components: components(true) });
                        };

                        ih.create_collector(on_collect, on_end, init);
                    } else {
                        status.push("**Managing days...**");

                        collector.stop("artificial");

                        const components = (state) => {
                            ih.create_row();

                            ih.makeNewButtonInteraction("Toggle days", ButtonStyle.Primary, state, "toggle");

                            ih.makeNewButtonInteraction("Change the number of days", ButtonStyle.Primary, state, "change");

                            const row = ih.return_row();

                            return [row];
                        };

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                        Interaction.update({
                            components: components(false),
                            embeds: [embed]
                        });

                        let counter = 0;

                        const on_collect = (Interaction, collector) => {
                            con.query(`SELECT * FROM serverAutoban WHERE guildId="${message.guild.id}"`, async (e, rows) => {

                                rows = rows[0];

                                if (Interaction.customId == "toggle") {
                                    if (counter >= 5) {
                                        return collector.stop();
                                    }

                                    const action = rows.days == "enabled" ? "disabled" : "enabled";
                                    const format = action.charAt(0).toUpperCase() + action.slice(1);
                                    status.push(`**${format} days.**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${action}__\n**Days:**  __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    Interaction.update({
                                        embeds: [embed]
                                    });

                                    con.query(`UPDATE serverAutoban SET days="${action}" WHERE guildId="${message.guild.id}"`);

                                    counter++;
                                } else {

                                    collector.stop("artificial");

                                    const cur_year = new Date().getFullYear();

                                    const discord_release = 2015;

                                    const max = (cur_year - discord_release - 1) * 365;

                                    const min = 1;

                                    status.push(`**:warning: Waiting for you to enter a number... (cannot exceed ${max} years aka ${max * 365} days and cannot be lower than 1) :warning:**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:** __${rows.day}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    Interaction.update({
                                        components: [],
                                        embeds: [embed]
                                    });

                                    const filter = m => m.author.id === message.author.id;

                                    message.channel.awaitMessages({
                                        filter,
                                        time: 60000,
                                        max: 1
                                    }).then(resp => {

                                        resp = resp.first();

                                        const number = parseInt(resp.content);

                                        if (isNaN(number) || number > max || number < min) {
                                            collector.stop("artificial");
                                            return mainFuncs.send(message, "Not a valid number.");
                                        }

                                        con.query(`UPDATE serverAutoban SET day="${resp.content}" WHERE guildId="${message.guild.id}"`);

                                        status.push("**Number of days changed.**");

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**Currently managing autoban..**\n\n__**DAYS**__\n**Ban if the account is less than X days old:** __${rows.days}__\n**Days:**  __${resp.content}__\n\n__**DATES**__ **\nBan if the account was created before X date:** __${rows.dates}__\n**Date:** __${rows.date}__\n\n__**MATCHING STRING**__\n**Ban if the account matches X string:** __${rows.strings}__\n**String:** __${rows.string}__\n\n__**INVITES**__\n**Ban if the account's name is an invite:** __${rows.invites}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                        if (init.editable) init.edit({ embeds: [embed] });

                                        collector.stop("artificial");

                                    }).catch((err) => {

                                        console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**You ran out of time.**`);

                                        if (init.editable) init.edit({ embeds: [embed] });
                                    });
                                }
                            });
                        };

                        const on_end = reason => {
                            if (reason == "artificial") return;
                            if (init.editable) init.edit({ components: components(true) });
                        };

                        ih.create_collector(on_collect, on_end, init);
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