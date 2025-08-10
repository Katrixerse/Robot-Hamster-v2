const { EmbedBuilder, Message, ButtonStyle, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder, ChannelType } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'manageleveling',
    aliases: ["mlv"],
    description: 'manageleveling command',
    usage: 'manageleveling',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const status = ["**Waiting for input..**"];
            con.query(`SELECT serverLevels FROM serverSettings WHERE guildId = "${message.guild.id}" LIMIT 1`, async (err, row) => {
                if (err) return console.log(err.stack);
                con.query(`SELECT levelUpMessages from serverLevelSettings WHERE guildId = "${message.guild.id}" LIMIT 1`, async (e, row2) => {
                    row = row[0];

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**LEVELING**__\n\n**Enabled**: __${row.serverLevels}__\n**Level up messages enabled:** __${row2[0].levelUpMessages}__\n\n__**STATUS**__\n${status.join("\n")}`);

                    const components = (state) => {
                        ih.create_row();

                        ih.makeNewButtonInteraction(`Toggle leveling`, ButtonStyle.Primary, state, `toggle`, "✅");

                        ih.makeNewButtonInteraction(`Toggle level up messages`, ButtonStyle.Primary, state, `lvl`, "📜");

                        ih.makeNewButtonInteraction(`Manage leveling settings`, ButtonStyle.Primary, state, `settings`, "🔧");

                        ih.makeNewButtonInteraction(`Manage leveling rewards`, ButtonStyle.Primary, state, `rewards`, "🏅");

                        ih.makeNewButtonInteraction(`Reset levels for this guild`, ButtonStyle.Secondary, state, `reset`, "🔁");

                        const row = ih.return_row();

                        return [row];
                    };

                    const init = await message.channel.send({
                        embeds: [embed],
                        components: components(false)
                    });

                    const on_collect = (Interaction, collector) => {
                        con.query(`SELECT serverLevels FROM serverSettings WHERE guildId = "${message.guild.id}" LIMIT 1`, async (err, row) => {
                            if (err) return console.log(err.stack);
                            con.query(`SELECT levelUpMessages from serverLevelSettings WHERE guildId = "${message.guild.id}" LIMIT 1`, async (e, row2) => {
                                row = row[0];
                                if (Interaction.customId == "toggle") {

                                    const new_val = row.serverLevels == "yes" ? "no" : "yes";

                                    status.push(`**Set leveling enabled to:** __${new_val}__`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`__**LEVELING**__\n\n**Enabled**: __${new_val}__\n**Level up messages enabled:** __${row2[0].levelUpMessages}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    con.query(`UPDATE serverSettings SET serverLevels="${new_val}" WHERE guildId="${message.guild.id}"`);

                                    await Interaction.update({
                                        embeds: [embed]
                                    });
                                } else if (Interaction.customId == "settings") {
                                    con.query(`SELECT * FROM serverLevelSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                        if (!row || row.length === 0) {
                                            con.promise().query(`INSERT INTO serverLevelSettings (guildId, minAmount, maxAmount, xpNeeded, maxLevel, levelUpMessages, badges, blockedChannels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [message.guild.id, 50, 100, 300, 100, "yes", "disabled", "none"]);
                                        }
                                        row = row[0];

                                        const components = (state) => {
                                            ih.create_row();

                                            ih.makeNewButtonInteraction(`Change min XP amount per message`, ButtonStyle.Primary, state, `mix`);

                                            ih.makeNewButtonInteraction(`Change max XP amount per message`, ButtonStyle.Primary, state, `max`);

                                            ih.makeNewButtonInteraction(`Change multiplier for XP needed to level up`, ButtonStyle.Primary, state, `mx`);

                                            const row1 = ih.return_row();
                                            ih.create_row();

                                            ih.makeNewButtonInteraction(`Change max level`, ButtonStyle.Primary, state, `ml`);

                                            ih.makeNewButtonInteraction(`Change blocked channels`, ButtonStyle.Primary, state, `manage-bc`);

                                            //ih.makeNewButtonInteraction(`Change level up message`, `PRIMARY`, `lm`, state);

                                            const row2 = ih.return_row();

                                            return [row1, row2];
                                        };

                                        status.push(`**Managing leveling..**`);

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                        await Interaction.update({
                                            components: components(false),
                                            embeds: [embed]
                                        });

                                        const filter = m => m.author.id === message.author.id;

                                        const on_collect = (Interaction, collector) => {
                                            con.query(`SELECT * FROM serverLevelSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                                if (Interaction.customId == "mix") {
                                                    row = row[0];

                                                    status.push(`**Waiting for you to enter a number..**`);

                                                    const embed = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

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
                                                        if (isNaN(number) || number <= 0 || number > row.maxAmount) {
                                                            collector.stop();
                                                            return mainFuncs.send(message, "Not a valid number.");
                                                        }

                                                        status.push(`**Value updated.**`);
                                                        const embed = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${number}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                        if (init.editable) init.edit({ embeds: [embed] });

                                                        con.query(`UPDATE serverLevelSettings SET minAmount=${number} WHERE guildId="${message.guild.id}"`);
                                                    }).catch(() => {
                                                        const embed1 = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`**You ran out of time.**`);
                                                        if (init.editable) init.edit({ embeds: [embed1] });
                                                    });
                                                } else if (Interaction.customId == "max") {
                                                    row = row[0];

                                                    status.push(`**Waiting for you to enter a number..**`);

                                                    const embed = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

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
                                                        if (isNaN(number) || number <= 0 || number < row.minAmount) {
                                                            collector.stop();
                                                            return mainFuncs.send(message, "Not a valid number.");
                                                        }

                                                        status.push(`**Value updated.**`);
                                                        const embed = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${number}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                        if (init.editable) init.edit({ embeds: [embed] });

                                                        con.query(`UPDATE serverLevelSettings SET maxAmount=${number} WHERE guildId="${message.guild.id}"`);
                                                    }).catch(() => {
                                                        const embed1 = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`**You ran out of time.**`);
                                                        if (init.editable) init.edit({ embeds: [embed1] });
                                                    });
                                                } else if (Interaction.customId == "mx") {
                                                    row = row[0];

                                                    status.push(`**Waiting for you to enter a number..**`);

                                                    const embed = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

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
                                                        if (isNaN(number) || number <= 0) {
                                                            collector.stop();
                                                            return mainFuncs.send(message, "Not a valid number.");
                                                        }

                                                        status.push(`**Value updated.**`);
                                                        const embed = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${number}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                        if (init.editable) init.edit({ embeds: [embed] });

                                                        con.query(`UPDATE serverLevelSettings SET xpNeeded=${number} WHERE guildId="${message.guild.id}"`);
                                                    }).catch(() => {
                                                        const embed1 = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`**You ran out of time.**`);
                                                        if (init.editable) init.edit({ embeds: [embed1] });
                                                    });
                                                } else if (Interaction.customId == "ml") {
                                                    row = row[0];

                                                    status.push(`**Waiting for you to enter a number..**`);

                                                    const embed = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

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
                                                        if (isNaN(number) || number <= 0) {
                                                            collector.stop();
                                                            return mainFuncs.send(message, "Not a valid number.");
                                                        }
                                                        if (number >= 1000000) return mainFuncs.send(message, "Max level can't be above 999999.");

                                                        status.push(`**Value updated.**`);
                                                        const embed = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${number}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                        if (init.editable) init.edit({ embeds: [embed] });

                                                        con.query(`UPDATE serverLevelSettings SET maxLevel=${number} WHERE guildId="${message.guild.id}"`);
                                                    }).catch(() => {
                                                        const embed1 = new EmbedBuilder()
                                                            .setColor(0x0000ff)
                                                            .setDescription(`**You ran out of time.**`);
                                                        if (init.editable) init.edit({ embeds: [embed1] });
                                                    });
                                                } else if (Interaction.customId == "manage-bc") {
                                                    row = row[0];
                                                    let RoleSelectRemove;
                                                    let RoleSelectDeleteRow;
                                                    collector.stop("artificial");
                                                    await message.guild.channels.fetch().catch(console.error);

                                                    const xpChannels = [];
                                                    const getChannels = message.guild.channels.cache.filter(c => c.type == ChannelType.GuildText);
                                                    if (getChannels.size >= 1) {
                                                        getChannels.map((x) => {
                                                            if (xpChannels.includes(x.name) == false && xpChannels.length <= 25) {
                                                                xpChannels.push({ label: x.name, value: x.name });
                                                            }
                                                        });
                                                    } else {
                                                        xpChannels.push({ label: "No suitable channels found", value: "No suitable channels found" });
                                                    }
                                                    console.log(xpChannels);
                                                    const components = (state) => {
                                                        const RoleSelectAdd = new StringSelectMenuBuilder()
                                                                .setCustomId('add-channel')
                                                                .setPlaceholder('Nothing selected')
                                                                .setDisabled(state)
                                                                .addOptions(xpChannels)
                                                        console.log(row.blockedChannels);

                                                        const RoleSelectRow = new ActionRowBuilder();
                                                        RoleSelectRow.addComponents([RoleSelectAdd]);

                                                        if (row.blockedChannels != "none") {
                                                            RoleSelectRemove = new StringSelectMenuBuilder()
                                                                .setCustomId('remove-channel')
                                                                .setPlaceholder('Nothing selected')
                                                                .setDisabled(state)
                                                                .addOptions(
                                                                    row.blockedChannels.split(",").filter(x => x !== 'none').map((x) => {
                                                                        return {
                                                                            label: x,
                                                                            value: x,
                                                                        };
                                                                    })
                                                                );

                                                            RoleSelectDeleteRow = new ActionRowBuilder();
                                                            RoleSelectDeleteRow.addComponents([RoleSelectRemove]);

                                                            return [RoleSelectRow, RoleSelectDeleteRow];
                                                        }
                                                            
                                                        return [RoleSelectRow];
                                                    };

                                                    const embed = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                    Interaction.update({
                                                        components: components(false),
                                                        embeds: [embed]
                                                    });

                                                    const on_collect = (Interaction, collector) => {
                                                        if (Interaction.customId == "add-channel") {
                                                            con.query(`SELECT * FROM serverLevelSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                                            row = row[0];
                                                            const selected = Interaction.values[0];
                                                            if (row.blockedChannels.includes(selected)) return mainFuncs.send(message, "This channel has already been added, please select another one.");

                                                            status.push(`**:white_check_mark: Added ${selected} channel to blocked channels (Users can no longer earn xp in these channels). :white_check_mark:**`);

                                                            con.query(`UPDATE serverLevelSettings SET blockedChannels="${row.blockedChannels},${selected}" WHERE guildId="${message.guild.id}"`);

                                                            const embed = new EmbedBuilder()
                                                                .setColor(0x0000ff)
                                                                .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${row.blockedChannels}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                            Interaction.update({
                                                                embeds: [embed],
                                                                components: components(false)
                                                            });
                                                        });
                                                        } else if (row.blockedChannel != 'none' && Interaction.customId == "remove-channel") {
                                                            con.query(`SELECT * FROM serverLevelSettings WHERE guildId ="${message.guild.id}"`, async (e, row) => {
                                                            row = row[0];
                                                            const selected = Interaction.values[0];
                                                            if (row.blockedChannels.includes(selected) === false) return mainFuncs.send(message, "This channel has already been removed, please select another one.");

                                                            status.push(`**:white_check_mark: Removed ${selected} channel from blocked channels (Users can now earn xp again in these channels). :white_check_mark:**`);

                                                            const fixRow = row.blockedChannels.split(",").filter(x => x !== selected).join(",");

                                                            con.query(`UPDATE serverLevelSettings SET blockedChannels="${fixRow}" WHERE guildId="${message.guild.id}"`);

                                                            const embed = new EmbedBuilder()
                                                                .setColor(0x0000ff)
                                                                .setDescription(`__**SETTINGS**__\n\n**Min XP amount:** __${row.minAmount}__\n**Max XP amount:** __${row.maxAmount}__\n**Multiplier:** __${row.xpNeeded}__\n**Max level:** __${row.maxLevel}__\n**Blocked channels:**__${fixRow}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                            Interaction.update({
                                                                embeds: [embed],
                                                                components: components(false)
                                                            });
                                                        });
                                                        }
                                                    };

                                                    const on_end = reason => {
                                                        if (reason == "artificial") return;
                                                        if (init.editable) init.edit({ components: components(true) });
                                                    };

                                                    ih.create_collector(on_collect, on_end, init);
                                                }
                                            });
                                        };

                                        const on_end = reason => {
                                            if (reason == 'artificial') return;
                                            if (init.editable) init.edit({ components: components(true) });
                                        };

                                        ih.create_collector(on_collect, on_end, init);
                                    });
                                } else if (Interaction.customId == "lvl") {
                                    const new_val = row2[0].levelUpMessages == "yes" ? "no" : "yes";

                                    status.push(`**Set level up messages enabled  to:** __${new_val}__`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`__**LEVELING**__\n\n**Enabled**: __${row.serverLevels}__\n**Level up messages enabled:** __${new_val}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                    con.query(`UPDATE serverLevelSettings SET levelUpMessages="${new_val}" WHERE guildId="${message.guild.id}"`);

                                    await Interaction.update({
                                        embeds: [embed]
                                    });
                                } else if (Interaction.customId == "reset") {
                                    con.query(`DELETE FROM serverLevels WHERE guildId="${message.guild.id}"`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**All levels have been wiped.**`);

                                    await Interaction.update({
                                        components: [],
                                        embeds: [embed]
                                    });

                                    collector.stop();
                                } else if (Interaction.customId == "rewards") {
                                    collector.stop("artificial");

                                    status.push(`**Managing level rewards..**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`__**REWARDS**__\n\n**Please select an option..**\n\n__**STATUS**__\n${status.join("\n")}`);

                                    const components = (state) => {
                                        ih.create_row();

                                        ih.makeNewButtonInteraction(`Add a role`, ButtonStyle.Primary, state, `add`, "📥");

                                        ih.makeNewButtonInteraction(`Remove a role from rewards`, ButtonStyle.Secondary, state, `remove`, "📤");

                                        return [ih.return_row()];
                                    };

                                    await Interaction.update({
                                        embeds: [embed],
                                        components: components(false)
                                    });

                                    const filter = m => m.author.id === message.author.id;

                                    const on_collect = (Interaction, collector) => {
                                        if (Interaction.customId == "add") {

                                            let cur_role;
                                            let cur_level;

                                            status.push(`**Waiting for you to enter role name..**`);

                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(`__**REWARDS**__\n\n**Current role:** __${cur_role == undefined ? "not selected" : cur_role.name}__\n**Level the role will be given at:** __${cur_level == undefined ? "not selected" : cur_level}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                            Interaction.update({
                                                embeds: [embed],
                                                components: []
                                            });

                                            message.channel.awaitMessages({
                                                filter,
                                                time: 60000,
                                                max: 1
                                            }).then(resp => {
                                                resp = resp.first().content;

                                                const role = message.guild.roles.cache.find(r => r.name == resp);
                                                if (!role || role.position >= message.guild.members.me.roles.highest.position || role.position >= message.member.roles.highest.position) {
                                                    collector.stop();
                                                    return mainFuncs.send(message, "Not a valid role.");
                                                }

                                                cur_role = role;

                                                status.push(`**Role selected.**`, `**Waiting for you to enter the level..**`);

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`__**REWARDS**__\n\n**Current role:** __${cur_role == undefined ? "not selected" : cur_role.name}__\n**Level the role will be given at:** __${cur_level == undefined ? "not selected" : cur_level}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                                if (init.editable) init.edit({ embeds: [embed] });

                                                message.channel.awaitMessages({
                                                    filter,
                                                    time: 60000,
                                                    max: 1
                                                }).then(resp => {
                                                    resp = resp.first().content;

                                                    const number = parseInt(resp);

                                                    if (isNaN(number) || number <= 1) {
                                                        collector.stop();
                                                        return mainFuncs.send(message, "Not a valid number.");
                                                    }

                                                    if (number > 500) {
                                                        collector.stop();
                                                        return mainFuncs.send(message, "Level cannot be over 500.");
                                                    }

                                                    const embed = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`**Members that reach level ${number} will now receive ${cur_role.name}**`);

                                                    if (init.editable) init.edit({ embeds: [embed] });

                                                    con.query(`INSERT INTO serverLevelRewards (guildId, levelRequired, role) VALUES (?, ? , ?)`, [message.guild.id, number, cur_role.id]);

                                                }).catch(() => {
                                                    const embed1 = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`**You ran out of time.**`);
                                                    if (init.editable) init.edit({ embeds: [embed1] });
                                                });

                                            }).catch((err) => {
                                                if (err.message !== undefined) console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                                                const embed1 = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`**You ran out of time.**`);
                                                if (init.editable) init.edit({ embeds: [embed1] });
                                            });
                                        } else {
                                            con.query(`SELECT * FROM serverLevelRewards WHERE guildId="${message.guild.id}"`, (e, rows) => {
                                                if (!rows || rows.length == 0) {
                                                    collector.stop();
                                                    return mainFuncs.send(message, "There are no level rewards to remove.");
                                                }

                                                const roles = rows.map(x => {
                                                    return {
                                                        role: message.guild.roles.cache.get(x.role) == undefined ? "Role not found" : message.guild.roles.cache.get(x.role),
                                                        lvl: x.levelRequired
                                                    };
                                                });

                                                status.push(`**Waiting for you to enter the name of the role you would like to remove..**`);

                                                const text = [];

                                                roles.forEach((r, i) => {
                                                    text.push(`**${i + 1}: ${r.role}** (will be given at level ${r.lvl})`);
                                                });

                                                const embed = new EmbedBuilder()
                                                    .setColor(0x0000ff)
                                                    .setDescription(`${text.join("\n")}\n\n__**STATUS**__\n${status.join("\n")}`);

                                                Interaction.update({
                                                    components: [],
                                                    embeds: [embed]
                                                });

                                                message.channel.awaitMessages({
                                                    filter,
                                                    time: 60000,
                                                    max: 1
                                                }).then(resp => {
                                                    resp = resp.first().content;

                                                    if (!roles.find(x => x.role.name == resp)) {
                                                        return mainFuncs.send(message, "Role not found in level rewards.");
                                                    }

                                                    const roleId = roles.find(x => x.role.name == resp).role.id;

                                                    con.query(`DELETE FROM serverLevelRewards WHERE guildId ="${message.guild.id}" AND role="${roleId}"`);

                                                    const embed1 = new EmbedBuilder()
                                                        .setColor(0x0000ff)
                                                        .setDescription(`**Role removed.**`);

                                                    if (init.editable) init.edit({ embeds: [embed1] });
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
                                }
                            });
                        });
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