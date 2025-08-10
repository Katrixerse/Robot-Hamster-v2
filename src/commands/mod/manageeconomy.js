const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");


const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

module.exports = {
    name: 'manageeconomy',
    aliases: ["meconomy"],
    description: 'manageeconomy command',
    usage: 'manageeconomy',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            con.query(`SELECT ServerCash FROM serverSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                row = row[0];

                const IH = require("../../handlers/interactions").IH;

                const ih = new IH(message);

                const status = ["**Waiting for input..**"];

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`__**ECONOMY**__\n**Currently:** __${row.ServerCash}__\n\n__**STATUS**__\n${status.join("\n")}`);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction(`Toggle economy`, ButtonStyle.Primary, state, `toggle`, "✅");

                    ih.makeNewButtonInteraction(`Manage economy settings`, ButtonStyle.Primary, state, `settings`, "⚙️");

                    ih.makeNewButtonInteraction(`Reset cash for this guild`, ButtonStyle.Secondary, state, `reset`, `🔁`);

                    ih.makeNewButtonInteraction(`Manage someone's cash`, ButtonStyle.Danger, state, `manage`, `✍️`);

                    return [ih.return_row()];
                };

                const init = await message.channel.send({
                    components: components(false),
                    embeds: [embed]
                });

                const on_collect = (Interaction, collector) => {
                    con.query(`SELECT ServerCash FROM serverSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                        con.query(`UPDATE serverSettings SET ServerCash="yes" WHERE guildId="${message.guild.id}"`);
                        row = row[0];
                        if (Interaction.customId == "toggle") {
                            const new_val = row.ServerCash == "yes" ? "no" : "yes";

                            status.push(`**Economy is now ${new_val}**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**ECONOMY**__\n**Currently:** __${new_val}__\n**Robbing:**__${row.disableRobbing}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            con.query(`UPDATE serverSettings SET ServerCash="${new_val}" WHERE guildId="${message.guild.id}"`);
                        } else if (Interaction.customId == "settings") {
                            con.query(`SELECT * FROM serverCashSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                if (!row || row.length === 0) {
                                    con.promise().query(`INSERT INTO serverCashSettings (guildId, currencyType, minAmount, maxAmount, blockedChannels, allowBoosters, disableRobbing) VALUES (?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, "$", 50, 100, "none", "true", "false"]);
                                }
                                row = row[0];

                                const components = (state) => {
                                    ih.create_row();

                                    ih.makeNewButtonInteraction(`Change currency`, ButtonStyle.Primary, state, `chngCurrency`, "🪙");

                                    ih.makeNewButtonInteraction(`Enable/disable robbing`, ButtonStyle.Primary, state, `mngRobbing`, "🪙");

                                    const row2 = ih.return_row();

                                    return [row2];
                                };

                                status.push(`**Managing economy..**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**SETTINGS**__\n\n**Currency:**__${row.currencyType}__\n**Robbing:**__${row.disableRobbing}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                await Interaction.update({
                                    components: components(false),
                                    embeds: [embed]
                                });

                                const filter = m => m.author.id === message.author.id;

                                const on_collect = (Interaction, collector) => {
                                    if (Interaction.customId == "chngCurrency") {
                                        con.query(`SELECT * FROM serverCashSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                            row = row[0];

                                            status.push(`**Waiting for you to enter a string..**`);

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(`__**SETTINGS**__\n\n**Currency:**__${row.currencyType}__\n**Robbing:**__${row.disableRobbing}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                            Interaction.update({
                                                embeds: [embed]
                                            });

                                            message.channel.awaitMessages({
                                                filter,
                                                time: 60000,
                                                max: 1
                                            }).then(resp => {
                                                resp = resp.first().content;
                                                if (resp.length >= 14) {
                                                    collector.stop();
                                                    return mainFuncs.send(message, "Currency name is too long, please choose another one.");
                                                }

                                                status.push(`**Value updated.**`);
                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`__**SETTINGS**__\n\n**Currency:**__${resp}__\n**Robbing:**__${row.disableRobbing}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                if (init.editable) init.edit({ embeds: [embed] });

                                                con.query(`UPDATE serverCashSettings SET currencyType=${con.escape(resp)} WHERE guildId="${message.guild.id}"`);
                                            }).catch(() => {
                                                const embed1 = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`**You ran out of time.**`);
                                                if (init.editable) init.edit({ embeds: [embed1] });
                                            });
                                        });
                                    } else if (Interaction.customId === "mngRobbing") {
                                        con.query(`SELECT * FROM serverCashSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                            row = row[0];

                                            const current_value = row.disableRobbing;
                                            const opposite_value = current_value == "true" ? "false" : "true";
    
                                            con.query(`UPDATE serverCashSettings SET disableRobbing="${opposite_value}" WHERE guildId="${message.guild.id}"`);
    
                                            status.push(`**Robbing has set to ${opposite_value} for this server**`);

                                            //collector.stop("artificial");

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(`__**SETTINGS**__\n\n**Currency:**__${row.currencyType}__\n**Robbing:**__${opposite_value}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                            Interaction.update({
                                                embeds: [embed]
                                            });
                                        });
                                    }
                                };

                                const on_end = reason => {
                                    if (reason == "artificial") return;
                                    if (init.editable) init.edit({ components: components(true) });
                                };

                                ih.create_collector(on_collect, on_end, init);
                            });
                        } else if (Interaction.customId == "reset") {
                            status.push(`**All levels have been wiped.**`);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**ECONOMY**__\n**Currently:** __${row.ServerCash}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            con.query(`DELETE FROM serverCash WHERE guildId="${message.guild.id}"`);
                        } else if (Interaction.customId == "manage") {
                            if (message.author.id !== message.guild.ownerId && message.author.id !== "307472480627326987") {
                                collector.stop();
                                return mainFuncs.send(message, "Only the guild owner can use this.");
                            }

                            let cur_user;

                            status.push(`**Waiting for you to mention someone/enter their ID..**`);

                            const generate_desc = (cur_user) => {
                                return `__**MANAGING CASH**__\n**Current user:** __${cur_user?.username || 'none'}__\n**User balance:** __$${numberWithCommas(cur_user?.cash || 0)}__\n**User bank:** __$${numberWithCommas(cur_user?.bank || 0)}__\n\n__**STATUS**__\n${status.join("\n")}`;
                            };

                            const components = (state) => {
                                ih.create_row();

                                ih.makeNewButtonInteraction(`Change balance`, ButtonStyle.Primary, state || cur_user == undefined, `bal`, "💰");

                                ih.makeNewButtonInteraction(`Change bank`, ButtonStyle.Primary, state || cur_user == undefined, `bank`, "🏦");

                                ih.makeNewButtonInteraction(`Reset everything`, ButtonStyle.Danger, state || cur_user == undefined, `reset`, "🔂");

                                return [ih.return_row()];
                            };

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(cur_user));

                            Interaction.update({
                                embeds: [embed],
                                components: components(false)
                            });

                            collector.stop("artificial");

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first();

                                if (resp.mentions.members.size > 0) {
                                    cur_user = resp.mentions.members.first();
                                } else {
                                    const finder = message.guild.members.cache.get(resp.content);
                                    cur_user = finder;
                                }

                                if (!cur_user) {
                                    return modFuncs.send(message, "You did not mention any users and a valid ID wasn't found in your response.");
                                }

                                con.query(`SELECT * FROM serverCash WHERE guildId="${message.guild.id}" AND userId="${cur_user.id}"`, (e, row) => {
                                    row = row[0];

                                    const current_user = {
                                        username: cur_user.user.username,
                                        id: cur_user.id,
                                        cash: row?.userPurse || 0,
                                        bank: row?.userBank || 0
                                    };

                                    cur_user = current_user;

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(generate_desc(cur_user));

                                    if (init.editable) init.edit({ embeds: [embed], components: components(false) });

                                    const on_collect = (Interaction, collector) => {
                                        if (Interaction.customId == "bal") {
                                            status.push(`**Enter new balance..**`);

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_desc(cur_user));

                                            Interaction.update({
                                                embeds: [embed]
                                            });

                                            message.channel.awaitMessages({
                                                filter,
                                                time: 60000,
                                                max: 1
                                            }).then(resp => {
                                                resp = resp.first().content;

                                                const number = parseInt(resp);

                                                if (isNaN(number) || number <= 0 || number >= 1000000000) {
                                                    return mainFuncs.send(message, "Number cannot be less than 1 or higher than 999,999,999");
                                                }

                                                con.query(`UPDATE serverCash SET userPurse=${number} WHERE guildId="${message.guild.id}" AND userId="${cur_user.id}"`);

                                                status.push(`**Set ${cur_user.username}'s balance to:** __$${numberWithCommas(number)}__`);

                                                cur_user.cash = number;

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(generate_desc(cur_user));

                                                if (init.editable) init.edit({ embeds: [embed] });
                                            }).catch(() => {
                                                const embed1 = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`**You ran out of time.**`);
                                                if (init.editable) init.edit({ embeds: [embed1] });
                                            });
                                        } else if (Interaction.customId == "bank") {
                                            status.push(`**Enter new bank amount..**`);

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_desc(cur_user));

                                            Interaction.update({
                                                embeds: [embed]
                                            });

                                            message.channel.awaitMessages({
                                                filter,
                                                time: 60000,
                                                max: 1
                                            }).then(resp => {
                                                resp = resp.first().content;

                                                const number = parseInt(resp);

                                                if (isNaN(number) || number <= 0 || number >= 1000000000) {
                                                    return mainFuncs.send(message, "Number cannot be less than 1 or higher than 999,999,999");
                                                }

                                                con.query(`UPDATE serverCash SET userBank=${number} WHERE guildId="${message.guild.id}" AND userId="${cur_user.id}"`);

                                                status.push(`**Set ${cur_user.username}'s bank to:** __$${numberWithCommas(number)}__`);

                                                cur_user.bank = number;

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(generate_desc(cur_user));

                                                if (init.editable) init.edit({ embeds: [embed] });
                                            }).catch(() => {
                                                const embed1 = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`**You ran out of time.**`);
                                                if (init.editable) init.edit({ embeds: [embed1] });
                                            });
                                        } else {
                                            status.push(`**User has been wiped.**`);

                                            cur_user.cash = 0;
                                            cur_user.bank = 0;

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(generate_desc(cur_user));

                                            Interaction.update({
                                                embeds: [embed]
                                            });

                                            con.query(`DELETE FROM serverCash WHERE userId="${cur_user.id}" AND guildId="${message.guild.id}"`);
                                        }
                                    };

                                    const on_end = reason => {
                                        if (reason == 'artificial') return;
                                        if (init.editable) init.edit({ components: components(true) });
                                    };

                                    ih.create_collector(on_collect, on_end, init);

                                });
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