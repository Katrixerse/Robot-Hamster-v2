const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: 'managecustomcommands',
    aliases: ["mcc"],
    description: 'Manage custom commands',
    usage: 'mcc',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageMessages],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            con.query(`SELECT * FROM serverCustomCommands WHERE guildId="${message.guild.id}"`, async (e, rows) => {

                const IH = require("../../handlers/interactions").IH;

                const ih = new IH(message);

                const inital_embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**What would you like to do?**\n\n**Please select an option from below.**`);

                const components = (state) => {
                    ih.create_row();

                    const opts = [{
                        label: "Add command",
                        value: "add"
                    },
                    {
                        label: "Remove command",
                        value: "remove"
                    },
                    {
                        label: "View all commands",
                        value: "view"
                    }
                    ];

                    if (rows.length == 0) opts.pop();

                    ih.makeNewSelectInteraction("select", "Select option..", state, opts);

                    const row = ih.return_row();

                    return [row];
                };

                const init = await message.channel.send({
                    embeds: [inital_embed],
                    components: components(false)
                });

                const on_collect = (Interaction, collector) => {
                    con.query(`SELECT * FROM serverCustomCommands WHERE guildId="${message.guild.id}"`, (e, rows) => {
                        const totalcc = rows;

                        if (Interaction.customId == "select") {

                            const selected = Interaction.values[0];

                            collector.stop("artificial");

                            if (selected == "add") {

                                if (totalcc.length >= 25) {
                                    if (Interaction.isRepliable()) return Interaction.reply("**This guild has reached the maximum amount of custom commands. (25)**");
                                }

                                let name;
                                let output;

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**Currently adding custom command..**\n\n**:warning: Please enter the NAME of the custom command you want to add :warning:**`)
                                    .addFields([
                                        { name: `Custom command name`, value: `None` },
                                        { name: `Custom command output`, value: `None` }
                                    ]);

                                const components = (state) => {
                                    ih.create_row();

                                    ih.makeNewButtonInteraction("Add command", ButtonStyle.Success, state || (!name && !output), "add");

                                    const row = ih.return_row();

                                    return [row];
                                };

                                Interaction.update({
                                    embeds: [embed],
                                    components: components(false)
                                });

                                let err = false;

                                const filter = m => m.author.id === message.author.id;

                                message.channel.awaitMessages({
                                    filter,
                                    time: 60000,
                                    max: 1
                                }).then(resp => {
                                    resp = resp.first();

                                    name = resp.content.substring(0, 24);
                                    const checkSpaces = /\s/g.test(name);
                                    if (checkSpaces) return mainFuncs.send(message, "A custom command can't have blank spaces.");

                                    const ccWithName = totalcc.find(x => x.name == name);

                                    if (ccWithName !== undefined) {
                                        err = true;
                                        return mainFuncs.send(message, "A custom command with that name already exists.");
                                    }

                                    const cWithNameExists = bot.commands.get(name);

                                    if (cWithNameExists !== undefined) {
                                        err = true;
                                        return mainFuncs.send(message, "A command with that name already exists.");
                                    }

                                    const embed1 = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**Currently adding custom command..**\n\n* Use ${prefix}placeholders for more options.\n**:warning: Please enter the OUTPUT of the custom command you want to add (check the placeholder command for more info) :warning:**`)
                                        .addFields([
                                            { name: `Custom command name`, value: `${name}` },
                                            { name: `Custom command output`, value: `None` }
                                        ]);

                                    if (init.editable) init.edit({ embeds: [embed1] });

                                    message.channel.awaitMessages({
                                        filter,
                                        time: 60000,
                                        max: 1
                                    }).then(resp => {
                                        resp = resp.first();

                                        output = resp.content.substring(0, 254);

                                        const embed1 = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**Currently adding custom command..**\n\n**:warning: Please click the add button to confirm adding this command. :warning:**`)
                                            .addFields([
                                                { name: `Custom command name`, value: `${name}` },
                                                { name: `Custom command output`, value: `${output}` }
                                            ]);

                                        const out = output;

                                        const matched = [];
                                        for (let i = 0; i < out.length; i++) {
                                            if (out[i] === "!" || out[i] === "+" || out[i] === "-") matched.push(i);
                                        }

                                        if (matched.length > 0) {
                                            matched.forEach((m, i) => {
                                                if (i % 2 == 0) {
                                                    const substr = out.substring(m + 1, matched[i + 1]);
                                                    const role = message.guild.roles.cache.find(r => r.name == substr);
                                                    if (role && (role.position >= message.member.roles.highest.position || role.position >= message.guild.members.me.roles.highest.position)) {
                                                        mainFuncs.send(message, "A role used in a placeholder of this command has a higher or the same position as you/me");
                                                        err = true;
                                                    }
                                                }
                                            });

                                            if (!err) {
                                                if (init.editable) init.edit({ components: components(false), embeds: [embed1] });
                                            }
                                        } else {
                                            if (init.editable) init.edit({ components: components(false), embeds: [embed1] });
                                        }
                                    }).catch(() => {
                                        const embed1 = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**You ran out of time.**`);

                                        if (init.editable) init.edit({ embeds: [embed1] });
                                    });
                                }).catch(() => {
                                    const embed1 = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**You ran out of time.**`);

                                    if (init.editable) init.edit({ embeds: [embed1] });
                                });


                                const on_collect = (Interaction, collector) => {
                                    if (Interaction.customId == "add") {
                                        collector.stop("artificial");

                                        if (name == undefined || output == undefined) return;

                                        console.log(`Adding ${name} ${output}`);
                                        con.query("INSERT INTO serverCustomCommands (guildId, name, output) VALUES (?, ?, ?)", [message.guild.id, name, output]);
                                        const embed2 = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`**:white_check_mark: Custom command added!**`);

                                        Interaction.update({
                                            components: [],
                                            embeds: [embed2]
                                        });
                                    }
                                };

                                const on_end = reason => {
                                    if (reason == 'artificial') return;
                                    if (init.editable) init.edit({ components: components(true) });
                                };

                                if (!err) ih.create_collector(on_collect, on_end, init);

                            } else if (selected == "remove") {

                                const remove_embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**Please choose a custom command to remove (if any exist)**`);

                                const components = (state) => {
                                    ih.create_row();

                                    let opts;

                                    if (totalcc.length == 0) {
                                        opts = {
                                            label: "No commands found",
                                            value: "ncf"
                                        };
                                    } else {
                                        opts = totalcc.map(x => {
                                            return {
                                                label: x.name,
                                                value: x.name
                                            };
                                        });

                                        opts.push({
                                            label: "Delete every command",
                                            value: "all_c"
                                        });
                                    }

                                    ih.makeNewSelectInteraction("remove_select", "Select command to remove..", state, opts);

                                    const row = ih.return_row();

                                    return [row];
                                };

                                Interaction.update({
                                    components: components(false),
                                    embeds: [remove_embed]
                                });

                                const on_collect = (Interaction, collector) => {
                                    if (Interaction.customId == "remove_select") {
                                        const selected = Interaction.values[0];

                                        if (selected == "ncf") return collector.stop();

                                        if (selected == "all_c") {
                                            const embed1 = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(`:white_check_mark: **Every custom command deleted!**`);

                                            con.query(`DELETE FROM serverCustomCommands WHERE guildId="${message.guild.id}"`);

                                            if (init.editable) init.edit({ components: [], embeds: [embed1] });
                                        } else {
                                            const embed1 = new EmbedBuilder()
                                                .setColor(0x0000ff)
                                                .setDescription(`:white_check_mark: **Custom command deleted!**`);

                                            con.query(`DELETE FROM serverCustomCommands WHERE guildId="${message.guild.id}" AND name="${selected}"`);

                                            if (init.editable) init.edit({ components: [], embeds: [embed1] });
                                        }

                                        collector.stop("artificial");
                                    }
                                };

                                const on_end = reason => {
                                    if (reason == "artificial") return;
                                    if (init.editable) init.edit({ components: components(true) });
                                };

                                ih.create_collector(on_collect, on_end, init);
                            } else {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**Here are all the custom commands..**`);

                                totalcc.forEach((x, i) => {
                                    embed1.addFields([
                                        { name: `**${i + 1}. Name:** ${x.name}`, value: `**Output:** ${x.output}` }
                                    ]);
                                });

                                Interaction.update({
                                    components: [],
                                    embeds: [embed1]
                                });
                            }
                        }
                    });
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