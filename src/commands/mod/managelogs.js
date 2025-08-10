const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, PermissionFlagsBits, ButtonStyle } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: 'managelogs',
    aliases: ["ml"],
    description: 'Manage moderation/chat logs',
    usage: 'managelogs',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
            con.query(`SELECT modlogs,chatlogs FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, row) => {
                if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                row = row[0];

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Please configure mod/chatlogs.\n\n\n•Modlogs currently: ${row.modlogs}\n\n•Chatlogs currently: ${row.chatlogs}**`);

                const components_onoff = (state) => {
                    const ModLogsSelect = new StringSelectMenuBuilder()
                        .setCustomId("modlogs-select")
                        .setDisabled(state)
                        .setPlaceholder("Change modlogs...")
                        .addOptions([
                            {
                                label: "Enabled",
                                value: "enabled",
                                emoji: "✅"
                            },
                            {
                                label: "Disabled",
                                value: "disabled",
                                emoji: "❎"
                            }
                        ]);

                    const ModLogsRow = new ActionRowBuilder();
                    ModLogsRow.addComponents(ModLogsSelect);

                    const ChatLogsSelect = new StringSelectMenuBuilder()
                        .setCustomId("chatlogs-select")
                        .setDisabled(state)
                        .setPlaceholder("Change chatlogs...")
                        .addOptions([
                            {
                                label: "Enabled",
                                value: "enabled",
                                emoji: "✅"
                            },
                            {
                                label: "Disabled",
                                value: "disabled",
                                emoji: "❎"
                            }
                        ]);

                    const ChatLogsRow = new ActionRowBuilder();
                    ChatLogsRow.addComponents(ChatLogsSelect);

                    const ChangeChannelsButton = new ButtonBuilder()
                        .setDisabled(state)
                        .setCustomId("ccb")
                        .setLabel("Change channels")
                        .setStyle(ButtonStyle.Primary);


                    const ManageEventsButton = new ButtonBuilder()
                        .setDisabled(state)
                        .setCustomId("meb")
                        .setLabel("Manage chatlogs events")
                        .setStyle(ButtonStyle.Primary);

                    const ChangeChannelRow = new ActionRowBuilder();
                    ChangeChannelRow.addComponents([ChangeChannelsButton, ManageEventsButton]);

                    return [ModLogsRow, ChatLogsRow, ChangeChannelRow];
                };

                const initialMessage = await message.channel.send({
                    embeds: [embed],
                    components: components_onoff(false)
                });

                const filter = (Interaction) => Interaction.user.id === message.author.id;

                const collector = message.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                    message: initialMessage
                });

                collector.on("collect", Interaction => {
                    switch (Interaction.customId) {
                        case "modlogs-select":
                            con.query(`SELECT modlogs,chatlogs FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, newrow) => {
                                const selected = Interaction.values[0];
                                const selected_format = selected.replace("enabled", "on").replace("disabled", "off");
                                con.query(`UPDATE serverSettings SET modlogs="${selected_format}" WHERE guildId="${message.guild.id}"`);
                                const new_embed = embed.setDescription(`**Please configure mod/chatlogs.\n\n\n•Modlogs currently: ${selected_format}\n\n•Chatlogs currently: ${newrow[0].chatlogs}**`);
                                Interaction.update({
                                    embeds: [new_embed]
                                });
                            });
                            break;
                        case "chatlogs-select":
                            con.query(`SELECT modlogs,chatlogs FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, newrow) => {
                                const selected = Interaction.values[0];
                                const selected_format = selected.replace("enabled", "on").replace("disabled", "off");
                                con.query(`UPDATE serverSettings SET chatlogs="${selected_format}" WHERE guildId="${message.guild.id}"`);
                                const new_embed = embed.setDescription(`**Please configure mod/chatlogs.\n\n\n•Modlogs currently: ${newrow[0].modlogs}\n\n•Chatlogs currently: ${selected_format}**`);
                                Interaction.update({
                                    embeds: [new_embed]
                                });
                            });
                            break;
                        case "ccb":
                            con.query(`SELECT modlogsChannel,chatlogsChannel FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, newrow) => {
                                const new_embed = embed;
                                new_embed.setDescription(`**Please configure mod/chatlogs channels.\n\n\n•Modlogs channel: ${newrow[0].modlogsChannel}\n\n•Chatlogs channel: ${newrow[0].chatlogsChannel}**`);

                                const components_ccb = (state) => {
                                    const modlogsOpts = message.guild.channels.cache.filter(c => c.type == ChannelType.GuildText).map(c => {
                                        return {
                                            label: c.name,
                                            value: c.name
                                        };
                                    });
                                    const chatlogsOpts = message.guild.channels.cache.filter(c => c.type == ChannelType.GuildText).map(c => {
                                        return {
                                            label: c.name,
                                            value: c.name
                                        };
                                    });
                                    const ModlogsChannelSelect = new StringSelectMenuBuilder()
                                        .setCustomId("modlogs-c-select")
                                        .setDisabled(state)
                                        .setPlaceholder("Change modlogs channel...")
                                        .addOptions(modlogsOpts.slice(0, 25));
                                    const ChatlogsChannelSelect = new StringSelectMenuBuilder()
                                        .setCustomId("chatlogs-c-select")
                                        .setDisabled(state)
                                        .setPlaceholder("Change chatlogs channel...")
                                        .addOptions(chatlogsOpts.slice(0, 25));

                                    const ModlogsChannelRow = new ActionRowBuilder();
                                    ModlogsChannelRow.addComponents(ModlogsChannelSelect);

                                    const ChatlogsChannelRow = new ActionRowBuilder();
                                    ChatlogsChannelRow.addComponents(ChatlogsChannelSelect);

                                    const ConfigButton = new ButtonBuilder()
                                        .setDisabled(state)
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel("Turn on/off")
                                        .setCustomId("tof");
                                    const ConfigRow = new ActionRowBuilder();
                                    ConfigRow.addComponents(ConfigButton);

                                    return [ModlogsChannelRow, ChatlogsChannelRow, ConfigRow];
                                };

                                Interaction.update({
                                    embeds: [new_embed],
                                    components: components_ccb(false)
                                });

                                const filter = (Interaction) => Interaction.user.id === message.author.id;

                                const collector = message.channel.createMessageComponentCollector({
                                    filter,
                                    time: 60000,
                                    message: initialMessage
                                });

                                collector.on("collect", Interaction => {
                                    if (Interaction.customId == "tof") {
                                        con.query(`SELECT modlogs,chatlogs FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, row) => {
                                            const embed = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(`**Please configure mod/chatlogs.\n\n\n•Modlogs currently: ${row[0].modlogs}\n\n•Chatlogs currently: ${row[0].chatlogs}**`);
                                            Interaction.update({
                                                embeds: [embed],
                                                components: components_onoff(false)
                                            });
                                        });
                                    } else if (Interaction.customId == "modlogs-c-select") {
                                        const selected = Interaction.values[0];
                                        con.query(`SELECT modlogsChannel,chatlogsChannel FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, newrow) => {
                                            con.query(`UPDATE serverSettings SET modlogsChannel=${con.escape(selected)} WHERE guildId="${message.guild.id}"`);
                                            const new_new_embed = new_embed;
                                            new_new_embed.setDescription(`**Please configure mod/chatlogs channels.\n\n\n•Modlogs channel: ${selected}\n\n•Chatlogs channel: ${newrow[0].chatlogsChannel}**`);
                                            Interaction.update({
                                                embeds: [new_new_embed]
                                            });
                                        });
                                    } else if (Interaction.customId == "chatlogs-c-select") {
                                        const selected = Interaction.values[0];
                                        con.query(`SELECT modlogsChannel,chatlogsChannel FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, newrow) => {
                                            con.query(`UPDATE serverSettings SET chatlogsChannel=${con.escape(selected)} WHERE guildId="${message.guild.id}"`);
                                            const new_new_embed = new_embed;
                                            new_new_embed.setDescription(`**Please configure mod/chatlogs channels.\n\n\n•Modlogs channel: ${newrow[0].modlogsChannel}\n\n•Chatlogs channel: ${selected}**`);
                                            Interaction.update({
                                                embeds: [new_new_embed]
                                            });
                                        });
                                    }
                                });

                                collector.on("end", () => {
                                    if (initialMessage.editable) initialMessage.edit({ components: components_ccb(true) });
                                });
                            });
                            break;
                        case "meb":
                            con.query(`SELECT disabledEvents FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, row) => {
                                row = row[0];
                                const disabledEvents = row.disabledEvents.split("|");

                                const events = {
                                    messageDelete: disabledEvents.includes("messageDelete") ? "disabled" : "enabled",
                                    messageUpdate: disabledEvents.includes("messageUpdate") ? "disabled" : "enabled",
                                    roleUpdate: disabledEvents.includes("roleUpdate") ? "disabled" : "enabled",
                                    channelUpdate: disabledEvents.includes("channelUpdate") ? "disabled" : "enabled",
                                    memberUpdate: disabledEvents.includes("memberUpdate") ? "disabled" : "enabled"
                                };

                                const components_meb = (state) => {
                                    const messageDeleteToggle = new ButtonBuilder()
                                        .setDisabled(state)
                                        .setLabel("Toggle message delete")
                                        .setCustomId("md")
                                        .setStyle(ButtonStyle.Primary);
                                    const messageUpdateToggle = new ButtonBuilder()
                                        .setDisabled(state)
                                        .setLabel("Toggle message update")
                                        .setCustomId("mu")
                                        .setStyle(ButtonStyle.Primary);
                                    const memberUpdateToggle = new ButtonBuilder()
                                        .setDisabled(state)
                                        .setLabel("Toggle member update")
                                        .setCustomId("mmu")
                                        .setStyle(ButtonStyle.Primary);
                                    const channelUpdateToggle = new ButtonBuilder()
                                        .setDisabled(state)
                                        .setLabel("Toggle channel update")
                                        .setCustomId("cu")
                                        .setStyle(ButtonStyle.Primary);
                                    const roleUpdateToggle = new ButtonBuilder()
                                        .setDisabled(state)
                                        .setLabel("Toggle role update")
                                        .setCustomId("ru")
                                        .setStyle(ButtonStyle.Primary);

                                    const ButtonRow = new ActionRowBuilder();
                                    ButtonRow.addComponents([messageDeleteToggle, messageUpdateToggle, memberUpdateToggle, roleUpdateToggle, channelUpdateToggle]);

                                    return [ButtonRow];
                                };

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**Please configure events.\n\n\n•Message delete is currently: ${events.messageDelete}\n\n•Message update is currently: ${events.messageUpdate}\n\n•Member update is currently: ${events.memberUpdate}\n\n•Role update is currently: ${events.roleUpdate}\n\n•Channel update is currently: ${events.channelUpdate}**`);

                                Interaction.update({
                                    embeds: [embed],
                                    components: components_meb(false)
                                });

                                const filter = (Interaction) => Interaction.user.id === message.author.id;

                                const collector = message.channel.createMessageComponentCollector({
                                    filter,
                                    time: 60000,
                                    message: initialMessage
                                });

                                collector.on("collect", Interaction => {
                                    con.query(`SELECT disabledEvents FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, row) => {
                                        row = row[0];
                                        const disabledEvents = row.disabledEvents.split("|");

                                        let events = {
                                            messageDelete: disabledEvents.includes("messageDelete") ? "disabled" : "enabled",
                                            messageUpdate: disabledEvents.includes("messageUpdate") ? "disabled" : "enabled",
                                            roleUpdate: disabledEvents.includes("roleUpdate") ? "disabled" : "enabled",
                                            channelUpdate: disabledEvents.includes("channelUpdate") ? "disabled" : "enabled",
                                            memberUpdate: disabledEvents.includes("memberUpdate") ? "disabled" : "enabled"
                                        };

                                        if (Interaction.customId == "md") {
                                            if (events.messageDelete == "enabled") {
                                                disabledEvents.push("messageDelete");
                                            } else {
                                                disabledEvents.splice(disabledEvents.indexOf("messageDelete"), 1);
                                            }
                                        } else if (Interaction.customId == "mu") {
                                            if (events.messageUpdate == "enabled") {
                                                disabledEvents.push("messageUpdate");
                                            } else {
                                                disabledEvents.splice(disabledEvents.indexOf("messageUpdate"), 1);
                                            }
                                        } else if (Interaction.customId == "mmu") {
                                            if (events.memberUpdate == "enabled") {
                                                disabledEvents.push("memberUpdate");
                                            } else {
                                                disabledEvents.splice(disabledEvents.indexOf("memberUpdate"), 1);
                                            }
                                        } else if (Interaction.customId == "cu") {
                                            if (events.channelUpdate == "enabled") {
                                                disabledEvents.push("channelUpdate");
                                            } else {
                                                disabledEvents.splice(disabledEvents.indexOf("channelUpdate"), 1);
                                            }
                                        } else if (Interaction.customId == "ru") {
                                            if (events.roleUpdate == "enabled") {
                                                disabledEvents.push("roleUpdate");
                                            } else {
                                                disabledEvents.splice(disabledEvents.indexOf("roleUpdate"), 1);
                                            }
                                        }

                                        events = {
                                            messageDelete: disabledEvents.includes("messageDelete") ? "disabled" : "enabled",
                                            messageUpdate: disabledEvents.includes("messageUpdate") ? "disabled" : "enabled",
                                            roleUpdate: disabledEvents.includes("roleUpdate") ? "disabled" : "enabled",
                                            channelUpdate: disabledEvents.includes("channelUpdate") ? "disabled" : "enabled",
                                            memberUpdate: disabledEvents.includes("memberUpdate") ? "disabled" : "enabled"
                                        };

                                        const new_embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**Please configure events.\n\n\n•Message delete is currently: ${events.messageDelete}\n\n•Message update is currently: ${events.messageUpdate}\n\n•Member update is currently: ${events.memberUpdate}\n\n•Role update is currently: ${events.roleUpdate}\n\n•Channel update is currently: ${events.channelUpdate}**`);

                                        con.query(`UPDATE serverSettings SET disabledEvents="${disabledEvents.join("|")}" WHERE guildId="${message.guild.id}"`);

                                        Interaction.update({
                                            embeds: [new_embed]
                                        });

                                    });
                                });

                                collector.on("end", () => {
                                    if (initialMessage.editable) initialMessage.edit({ components: components_onoff(true) });
                                });
                            });
                            break;
                    }
                });

                collector.on("end", () => {
                    if (initialMessage.editable) initialMessage.edit({ components: components_onoff(true) });
                });
            });
        });
    }
};