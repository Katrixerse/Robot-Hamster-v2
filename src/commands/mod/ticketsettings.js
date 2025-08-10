const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'ticketsettings',
    aliases: ["tktstgs"],
    description: 'Ticket settings',
    usage: 'tktoptsg',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            con.query(`SELECT * FROM serverTicketOpts WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                if (!rows || rows.length === 0) {
                    con.promise().query("INSERT INTO serverTicketOpts (guildId, content, field_name, field_val) VALUES (?, ?, ?, ?)", [message.guild.id, "none", "none", "none"]);
                }
                rows = rows[0];

                const content = rows.content;
                const field_name = rows.field_name;
                const field_val = rows.field_val;
                const status = ["**Waiting for input..**"];

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`__**TICKET SETTINGS**__\nNotes: Set to none to remove it.\n\n**Current content:** __${content}__\n**Current field name:** __${field_name}__\n**Current field value:** __${field_val}__\n\n__**STATUS**__\n${status.join("\n")}`);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction("Change message content", ButtonStyle.Primary, state, "content", "📜");

                    ih.makeNewButtonInteraction("Change field name", ButtonStyle.Primary, state, "f_name", "📎");

                    ih.makeNewButtonInteraction("Change field value", ButtonStyle.Primary, state, "f_val", "🖇️");

                    const row = ih.return_row();

                    return [row];
                };

                const init = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const filter = m => m.author.id === message.author.id;

                const on_collect = (Interaction, collector) => {
                    con.query(`SELECT * FROM serverTicketOpts WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                        rows = rows[0];

                        const content = rows.content;
                        const field_name = rows.field_name;
                        const field_val = rows.field_val;

                        if (Interaction.customId == "content") {
                            status.push("**:warning: Waiting for you to enter message content.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**TICKET SETTINGS**__\n\n**Current content:** __${content}__\n**Current field name:** __${field_name}__\n**Current field value:** __${field_val}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;

                                con.query(`UPDATE serverTicketOpts SET content="${resp}" WHERE guildId="${message.guild.id}"`);

                                status.push(`**:white_check_mark: Content updated! :white_check_mark:**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**TICKET SETTINGS**__\n\n**Current content:** __${resp}__\n**Current field name:** __${field_name}__\n**Current field value:** __${field_val}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed] });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);

                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "f_name") {
                            status.push("**:warning: Waiting for you to enter field name.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**TICKET SETTINGS**__\n\n**Current content:** __${content}__\n**Current field name:** __${field_name}__\n**Current field value:** __${field_val}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;

                                con.query(`UPDATE serverTicketOpts SET field_name="${resp}" WHERE guildId="${message.guild.id}"`);

                                status.push(`**:white_check_mark: Field name updated! :white_check_mark:**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**TICKET SETTINGS**__\n\n**Current content:** __${content}__\n**Current field name:** __${resp}__\n**Current field value:** __${field_val}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed] });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);

                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else {
                            status.push("**:warning: Waiting for you to enter field value.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**TICKET SETTINGS**__\n\n**Current content:** __${content}__\n**Current field name:** __${field_name}__\n**Current field value:** __${field_val}__\n\n__**STATUS**__\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;

                                con.query(`UPDATE serverTicketOpts SET field_val="${resp}" WHERE guildId="${message.guild.id}"`);

                                status.push(`**:white_check_mark: Field value updated! :white_check_mark:**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**TICKET SETTINGS**__\n\n**Current content:** __${content}__\n**Current field name:** __${field_name}__\n**Current field value:** __${resp}__\n\n__**STATUS**__\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed] });
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
                    if (reason == "artificial") return;
                    if (init.editable) init.edit({ components: components(true) });
                };

                ih.create_collector(on_collect, on_end, init);
            });
        });
    }
};