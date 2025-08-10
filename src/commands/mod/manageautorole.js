const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: 'manageautoroles',
    aliases: ["mar"],
    description: 'Manage auto roles.',
    usage: 'mar',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageRoles],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            con.query(`SELECT enabled FROM serverAutoroles WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                rows = rows[0];

                const embed = new EmbedBuilder()
                    .setDescription(`**Please configure autoroles.\n\n•Currently: ${rows.enabled.replace("yes", "enabled").replace("no", "disabled")}**`)
                    .setColor(0x0000ff);

                const components_onoff = (state) => {

                    const EnableButton = new ButtonBuilder()
                        .setCustomId("enable")
                        .setStyle(ButtonStyle.Primary)
                        .setLabel("Enable")
                        .setDisabled(state);

                    const DisableButton = new ButtonBuilder()
                        .setCustomId("disable")
                        .setStyle(ButtonStyle.Primary)
                        .setLabel("Disable")
                        .setDisabled(state);

                    const ChangeButton = new ButtonBuilder()
                        .setCustomId("change")
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel("Change roles")
                        .setDisabled(state);

                    const EnableDisableRow = new ActionRowBuilder();
                    EnableDisableRow.addComponents([EnableButton, DisableButton, ChangeButton]);

                    return [EnableDisableRow];
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
                    con.query(`SELECT * FROM serverAutoroles WHERE guildId="${message.guild.id}"`, async (e, new_rows) => {
                        new_rows = new_rows[0];
                        if (Interaction.customId == "enable") {
                            con.query(`UPDATE serverAutoroles SET enabled='yes' WHERE guildId='${message.guild.id}'`);
                            const new_embed = embed;
                            new_embed.setDescription(` ** Please configure autoroles.\n\n•Currently: enabled** `);
                            Interaction.update({
                                embeds: [new_embed]
                            });
                        } else if (Interaction.customId == "disable") {
                            con.query(`UPDATE serverAutoroles SET enabled='no' WHERE guildId='${message.guild.id}'`);
                            const new_embed = embed;
                            new_embed.setDescription(` ** Please configure autoroles.\n\n•Currently: disabled** `);
                            Interaction.update({
                                embeds: [new_embed]
                            });
                        } else {

                            const current_roles_raw = new_rows.roles.split("¶");

                            let current_roles = current_roles_raw.filter(x => message.guild.roles.cache.find(r => r.name == x) !== undefined).map(x => {
                                return message.guild.roles.cache.find(r => r.name == x);
                            });


                            let opts2;

                            const roles = [];
                            const addedRoles = [];

                            message.guild.roles.cache.forEach(r => {
                                if (addedRoles.includes(r.name)) return;
                                if (r.name == "@everyone") return;
                                roles.push({ label: r.name, value: r.name });
                                addedRoles.push(r.name);
                            });

                            const components_roles = (state, current_r) => {
                                if (!current_r) return;
                                if (current_r.length > 0) {
                                    opts2 = current_r.slice(0, 25).map(r => {
                                        return {
                                            label: r.name,
                                            value: r.name
                                        };
                                    });
                                } else {
                                    opts2 = {
                                        label: "No roles found",
                                        value: "NRF"
                                    };
                                }

                                const RoleSelect = new StringSelectMenuBuilder()
                                    .setCustomId("role-select")
                                    .setDisabled(state)
                                    .addOptions(roles)
                                    .setPlaceholder("Select role...");

                                const RoleSelectRemove = new StringSelectMenuBuilder()
                                    .setCustomId("role-select-del")
                                    .setDisabled(state)
                                    .addOptions(opts2)
                                    .setPlaceholder("Select role to remove...");


                                const RoleSelectRow = new ActionRowBuilder();
                                RoleSelectRow.addComponents([RoleSelect]);

                                const RoleSelectDeleteRow = new ActionRowBuilder();
                                RoleSelectDeleteRow.addComponents([RoleSelectRemove]);


                                return [RoleSelectRow, RoleSelectDeleteRow];
                            };

                            collector.stop("artificial");

                            const new_embed = embed;
                            new_embed.setDescription(`**Please configure roles.(If the roles arent in the selection menu please mention the role instead)\n\n•Current roles: ${current_roles.join(",")}**`);

                            Interaction.update({
                                embeds: [new_embed],
                                components: components_roles(false, current_roles)
                            });

                            const filter = (Interaction) => Interaction.user.id === message.author.id;

                            const collector2 = message.channel.createMessageComponentCollector({
                                filter,
                                time: 60000,
                                message: initialMessage
                            });

                            try {
                                collector2.on("collect", Interaction2 => {
                                    con.query(`SELECT roles,enabled FROM serverAutoroles WHERE guildId="${message.guild.id}"`, async (e, new_new_rows) => {
                                        new_new_rows = new_new_rows[0];

                                        if (Interaction2.customId == "role-select") {
                                            const selected = Interaction2.values[0];

                                            if (current_roles_raw.includes(selected)) return Interaction2.reply("**That role has already been added, please pick another one.**").then(_ => setTimeout(_ => Interaction2.deleteReply(), 7000));
                                            current_roles_raw.push(selected);

                                            current_roles = current_roles_raw.filter(x => message.guild.roles.cache.find(r => r.name == x) !== undefined).map(x => {
                                                return message.guild.roles.cache.find(r => r.name == x);
                                            });


                                            con.query(`UPDATE serverAutoroles SET roles="${current_roles_raw.join('¶')}" WHERE guildId="${message.guild.id}"`);

                                            const new_new_embed = new_embed;

                                            new_new_embed.setDescription(`**Please configure roles.\n\n•Current roles: ${current_roles.join(",")}**`);

                                            Interaction2.update({
                                                components: components_roles(false, current_roles),
                                                embeds: [new_new_embed]
                                            });
                                        } else if (Interaction2.customId == "role-select-del") {
                                            const selected = Interaction2.values[0];

                                            current_roles_raw.splice(current_roles_raw.indexOf(selected), 1);

                                            current_roles = current_roles_raw.filter(x => message.guild.roles.cache.find(r => r.name == x) !== undefined).map(x => {
                                                return message.guild.roles.cache.find(r => r.name == x);
                                            });

                                            con.query(`UPDATE serverAutoroles SET roles="${current_roles_raw.join('¶')}" WHERE guildId="${message.guild.id}"`);

                                            const new_new_embed = new_embed;

                                            new_new_embed.setDescription(`**Please configure roles.\n\n•Current roles: ${current_roles.join(",")}**`);

                                            Interaction2.update({
                                                components: components_roles(false, current_roles),
                                                embeds: [new_new_embed]
                                            });
                                        } else {
                                            message.channel.awaitMessages({
                                                filter,
                                                time: 60000,
                                                max: 1
                                            }).then(resp2 => {
                                                resp2 = resp2.first().mentions.roles.first();

                                                if (!resp2) {
                                                    return mainFuncs.send(message, "You did not mention a role.");
                                                }
                                                mainFuncs.send(message, "Would you like to add or remove the role?");
                                                message.channel.awaitMessages({
                                                    filter,
                                                    time: 60000,
                                                    max: 1
                                                }).then(resp => {
                                                    resp = resp.first().content;

                                                    if (!resp) {
                                                        return mainFuncs.send(message, "You did not mention a role.");
                                                    }

                                                    if (resp === 'add') {
                                                        if (current_roles.includes(resp.name)) return mainFuncs.send(message, "**That role has already been added, please pick another one.**", 10000);
                                                        current_roles_raw.push(resp2.name);

                                                        current_roles = current_roles_raw.filter(x => message.guild.roles.cache.find(r => r.name == x) !== undefined).map(x => {
                                                            return message.guild.roles.cache.find(r => r.name == x);
                                                        });

                                                        con.query(`UPDATE serverAutoroles SET roles="${current_roles_raw.join('¶')}" WHERE guildId="${message.guild.id}"`);

                                                        const new_new_embed = new_embed;

                                                        new_new_embed.setDescription(`**Please configure roles.\n\n•Current roles: ${current_roles.join(",")}**`);

                                                        Interaction2.update({
                                                            components: components_roles(false, current_roles),
                                                            embeds: [new_new_embed]
                                                        });
                                                    } else if (resp === 'remove') {
                                                        if (!current_roles.includes(resp.name)) return mainFuncs.send(message, "**That role hasn't been added, please pick another one.**", 10000);
                                                        current_roles_raw.splice(current_roles_raw.indexOf(resp), 1);

                                                        current_roles = current_roles_raw.filter(x => message.guild.roles.cache.find(r => r.name == x) !== undefined).map(x => {
                                                            return message.guild.roles.cache.find(r => r.name == x);
                                                        });

                                                        con.query(`UPDATE serverAutoroles SET roles="${current_roles_raw.join('¶')}" WHERE guildId="${message.guild.id}"`);

                                                        const new_new_embed = new_embed;

                                                        new_new_embed.setDescription(`**Please configure roles.\n\n•Current roles: ${current_roles.join(",")}**`);

                                                        Interaction2.update({
                                                            components: components_roles(false, current_roles),
                                                            embeds: [new_new_embed]
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            } catch (err) {
                                if (e.message == "Unknown interaction") return;
                                console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                            }

                            collector2.on("end", () => {
                                if (initialMessage.editable) initialMessage.edit({ components: components_roles(true, false) });
                            });
                        }
                    });
                });


                collector.on("end", (_, r) => {
                    if (r == "artificial") return;
                    if (initialMessage.editable) initialMessage.edit({ components: components_onoff(true) });
                });

            });
        });
    }
};