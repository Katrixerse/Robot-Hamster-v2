const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
const { IH } = require("../../handlers/interactions");
module.exports = {
    name: 'managestaff',
    aliases: ["mngstaff"],
    description: 'Manage staff command',
    usage: 'managestaff',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.Administrator, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const status = ["**Waiting for input..**"];

            let cur_user = undefined;
            let cur_rank = "none";

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**STAFF**__\n**Please select an option.**`);

            const components = (state) => {
                ih.create_row();

                ih.makeNewButtonInteraction("Add a user to staff", ButtonStyle.Success, state, "add");

                ih.makeNewButtonInteraction("Remove a user from staff", ButtonStyle.Danger, state, "rem");

                ih.makeNewButtonInteraction("View all staff", ButtonStyle.Primary, state, "v", "🔍");

                const row = ih.return_row();

                return [row];
            };

            const init = await message.channel.send({
                embeds: [embed],
                components: components(false)
            });

            const filter = m => m.author.id === message.author.id;

            const on_collect = (Interaction, collector) => {
                collector.stop("artificial");

                if (Interaction.customId == "add") {
                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**STAFF**__\n**Current user:** __${cur_user == undefined ? 'none' : cur_user.user.username}__\n\n**Rank they will be granted:** __${cur_rank}__\n\n__**STATUS**__\n${status.join("\n")}`);

                    const components_main = (state) => {
                        ih.create_row();

                        ih.makeNewButtonInteraction("Change user", ButtonStyle.Primary, state, "change", "🔁");

                        ih.makeNewButtonInteraction("Change rank", ButtonStyle.Primary, state || cur_user == undefined, "change_r", "🔂");

                        ih.makeNewButtonInteraction("Confirm", ButtonStyle.Primary, state || (cur_rank == "none" || cur_user == undefined), "confirm", "✅");

                        const row = ih.return_row();

                        return [row];
                    };

                    Interaction.update({
                        embeds: [embed],
                        components: components_main(false)
                    });

                    const on_collect = (Interaction, collector) => {
                        con.query(`SELECT * FROM serverStaff WHERE guildId="${message.guild.id}"`, async (e, rows) => {

                            let non_staff;

                            if (!rows || rows.length == 0) {
                                non_staff = await message.guild.members.fetch();
                            } else {
                                const all_members = await message.guild.members.fetch();

                                rows = rows.map(x => x.userId);

                                non_staff = all_members.filter(m => !rows.includes(m.id));
                            }

                            if (Interaction.customId == "change") {

                                status.push("**:warning:Waiting for you to mention a user..:warning:**");

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**STAFF**__\n**Current user:** __${cur_user == undefined ? 'none' : cur_user.user.username}__\n\n**Rank they will be granted:** __${cur_rank}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                Interaction.update({
                                    embeds: [embed]
                                });

                                message.channel.awaitMessages({
                                    filter,
                                    time: 60000,
                                    max: 1
                                }).then(async resp => {
                                    resp = resp.first().mentions.members.first();

                                    if (!resp) {
                                        collector.stop();
                                        return mainFuncs.send(message, "You did not mention anyone.");
                                    }

                                    const checkMember = await guild.members.fetch({ user: resp.id });
                                    if (!checkMember) return mainFuncs.send(message, "That user is not in this server.");

                                    if (!rows.includes(resp.id)) {
                                        collector.stop();
                                        return mainFuncs.send(message, "That user is already a staff member.");
                                    }

                                    status.push("**:white_check_mark: Member updated. You can now select a rank! :white_check_mark:**");
                                    cur_user = resp;

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`__**STAFF**__\n**Current user:** __${cur_user == undefined ? 'none' : cur_user.user.username}__\n\n**Rank they will be granted:** __${cur_rank}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    if (init.editable) init.edit({ embeds: [embed], components: components_main(false) });

                                }).catch((e) => {
                                    const embed1 = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**You ran out of time.**`);

                                    if (init.editable) init.edit({ components: [], embeds: [embed1] });
                                });
                            } else if (Interaction.customId == "change_r") {
                                status.push("**:warning:Waiting for you to select a rank..:warning:**");

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**STAFF**__\n**Current user:** __${cur_user == undefined ? 'none' : cur_user.user.username}__\n\n**Rank they will be granted:** __${cur_rank}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                const opts = [{
                                    label: "Trial Mod",
                                    value: "trial mod"
                                }, {
                                    label: "Mod",
                                    value: "mod"
                                }, {
                                    label: "Admin",
                                    value: "admin"
                                }];

                                const components = (state) => {
                                    ih.create_row();

                                    ih.makeNewSelectInteraction("r-s", "Select a rank..", state, opts);

                                    const row = ih.return_row();

                                    return [row];
                                };

                                Interaction.update({
                                    embeds: [embed],
                                    components: components(false)
                                });

                                const on_collect = async (Interaction, collector) => {
                                    collector.stop("artificial");

                                    const selected = Interaction.values[0];

                                    cur_rank = selected;

                                    status.push("**:white_check_mark: Rank updated. You can now press the confirm button and add this member as that rank! :white_check_mark:**");

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`__**STAFF**__\n**Current user:** __${cur_user == undefined ? 'none' : cur_user.user.username}__\n\n**Rank they will be granted:** __${cur_rank}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    await Interaction.update({
                                        components: components_main(false),
                                        embeds: [embed]
                                    });
                                };

                                const on_end = reason => {
                                    if (reason == "artificial") return;
                                    if (init.editable) init.edit({ components: components(true) });
                                };

                                ih.create_collector(on_collect, on_end, init);
                            } else {
                                const embed = new EmbedBuilder()
                                    .setColor(0x00ff00)
                                    .setDescription(`**${cur_user.user.username} has been given the ${cur_rank} rank, they can now use commands requiring that rank without needing the permissions required.**`);

                                await Interaction.update({
                                    components: [],
                                    embeds: [embed]
                                });

                                con.query(`INSERT INTO serverStaff (guildId, userId, userRank) VALUES (?, ? , ?)`, [message.guild.id, cur_user.id, cur_rank]);
                                collector.stop("artificial");
                            }
                        });
                    };

                    const on_end = reason => {
                        if (reason == "artificial") return;
                        if (init.editable) init.edit({ components: components(true) });
                    };

                    ih.create_collector(on_collect, on_end, init);
                } else if (Interaction.customId == "v") {
                    con.query(`SELECT * FROM serverStaff WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                        if (!rows || rows.length == 0) {
                            collector.stop();
                            return mainFuncs.send(message, "There are no staff members in this guild.");
                        }

                        let embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setTitle(`Staff Members`)
                            .setTimestamp();

                        const text = [];

                        rows.forEach((row, i) => {
                            const member = message.guild.members.cache.get(row.userId) == null ? "Member not found" : message.guild.members.cache.get(row.userId).user.username;
                            text.push(`${i + 1}: **Username:** __${member}__\n**Rank:** __${row.userRank}__`);
                        });

                        embed = embed.setDescription(text.join("\n"));

                        await Interaction.update({
                            embeds: [embed],
                            components: []
                        });

                        collector.stop("artificial");
                    });
                } else {
                    con.query(`SELECT * FROM serverStaff WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                        if (!rows || rows.length == 0) {
                            collector.stop();
                            return mainFuncs.send(message, "There are no staff members in this guild to remove.");
                        }

                        rows = rows.map(x => x.userId);

                        status.push("**:warning: Waiting for you to mention the user you want to remove from staff.. :warning:**");

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**STATUS**__\n${status.join("\n")}`);

                        Interaction.update({
                            embeds: [embed],
                            components: []
                        });

                        message.channel.awaitMessages({
                            filter,
                            time: 60000,
                            max: 1
                        }).then(async resp => {
                            resp = resp.first().mentions.members.first();

                            if (!resp) {
                                collector.stop();
                                return mainFuncs.send(message, "You did not mention anyone.");
                            }

                            if (!rows.includes(resp.id)) {
                                collector.stop();
                                return mainFuncs.send(message, "That user is not a staff member.");
                            }

                            con.query(`DELETE FROM serverStaff WHERE guildId="${message.guild.id}" AND userId="${resp.id}"`);

                            const embed = new EmbedBuilder()
                                .setColor(0x00ff00)
                                .setDescription(`**${resp.user.username} has been removed from staff.**`);

                            if (init.editable) init.edit({ embeds: [embed], components: [] });

                            collector.stop("artificial");

                        }).catch((err) => {
                            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                            const embed1 = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**You ran out of time.**`);

                            if (init.editable) init.edit({ components: [], embeds: [embed1] });
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
    }
};