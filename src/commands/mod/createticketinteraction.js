const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");
const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'createticketinteraction',
    aliases: ["crttkti"],
    description: 'Create a ticket interaction message in the current channel',
    usage: 'crttkti',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.AddReactions],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const status = ["**Waiting for input..**"];

            let curdesc;
            let curtitle;

            con.query(`SELECT * FROM serverTicketReaction WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                if (rows.length > 10) return mainFuncs.send(message, "Can't have more than 10 reaction tickets in a guild, please delete some before trying to add more.");
                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**TICKET CREATE ON REACTION**\n\n**Current embed description:** ${curdesc || "React to this message to create a ticket."}\n**Current title:** ${curtitle || "Ticket On React"}\n\n**STATUS**\n${status.join("\n")}`);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction("Send message with interaction", ButtonStyle.Success, state, "submit", "✅");

                    ih.makeNewButtonInteraction("Change description", ButtonStyle.Primary, state, "desc", "📝");

                    ih.makeNewButtonInteraction("Change title", ButtonStyle.Primary, state, "title", "📜");

                    //ih.makeNewButtonInteraction("Change content", "PRIMARY", "content", state, "📜");

                    const row = ih.return_row();

                    return [row];
                };

                const init = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const on_collect = (Interaction, collector) => {
                    con.query(`SELECT * FROM serverTicketReaction WHERE guildId="${message.guild.id}" AND cid="${message.channel.id}"`, async (e, rows) => {
                        if (rows.length > 1) {
                            if (rows[0].cid === message.channel.id) {
                                collector.stop("artificial");
                                mainFuncs.send(message, ":warning: You can only have one ticket interaction message per channel. :warning:");
                            }
                        }
                        rows = rows[0];

                        if (Interaction.customId == "desc") {
                            status.push("**:warning: Waiting for you to enter a description.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**TICKET CREATE ON INTERACTION**\n\n**Current embed description:** ${curdesc || "React to this message to create a ticket."}\n**Current title:** ${curtitle || "Ticket On React"}\n\n**STATUS**\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first();

                                status.push("**:white_check_mark: Description updated :white_check_mark:**");

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**TICKET CREATE ON INTERACTION**\n\n**Current embed description:** ${resp.content}\n**Current title:** ${curtitle || "Ticket On React"}\n\n**STATUS**\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed] });

                                curdesc = resp.content;

                                if (resp && resp.deletable) {
                                    resp.delete();
                                }
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);

                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "title") {
                            status.push("**:warning: Waiting for you to enter a title.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**TICKET CREATE ON INTERACTION**\n\n**Current embed description:** ${curdesc || "React to this message to create a ticket."}\n**Current title:** ${curtitle || "Ticket On React"}\n\n**STATUS**\n${status.join("\n")}`);

                            Interaction.update({
                                embeds: [embed]
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first();

                                status.push("**:white_check_mark: Title updated :white_check_mark:**");

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**TICKET CREATE ON INTERACTION**\n\n**Current embed description:** ${curdesc || "React to this message to create a ticket."}\n**Current title:** ${resp.content}\n\n**STATUS**\n${status.join("\n")}`);

                                if (init.editable) init.edit({ embeds: [embed] });

                                curtitle = resp.content;

                                if (resp && resp.deletable) {
                                    resp.delete();
                                }
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);

                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else {

                            const components = (state) => {
                                ih.create_row();
            
                                ih.makeNewButtonInteraction("Open Ticket", ButtonStyle.Success, state, "openNewTicket", "📨");
            
                                const row = ih.return_row();
            
                                return [row];
                            };
            
                            //const init = await message.channel.send({
                            //    embeds: [embed],
                            //    components: components(false)
                            //});

                            const reactEmbed = new EmbedBuilder()
                                .setDescription(curdesc || "Click the button to open a ticket.")
                                .setColor(0x0000ff)
                                .setTitle(curtitle || "Open Ticket");

                            await Interaction.update({
                                components: components(false),
                                embeds: [reactEmbed]
                            });

                            if (message.deletable) message.delete();

                            //con.query(`DELETE FROM serverTicketReaction WHERE guildId="${message.guild.id}"`);

                            // CLEANING OLD MESSAGE

                            const channel = message.guild.channels.cache.get(rows?.cid || "");

                            if (channel) {
                                const messages = await channel.messages.fetch();
                                const message = messages.get(rows.mid);
                                if (message) return mainFuncs.send(message, "There\'s already an interaction tickets in this channel. (LIMIT 1 per channel)");
                            }

                            collector.stop("artificial");

                            // INSERTING NEW ROW

                            con.query(`INSERT INTO serverTicketReaction (guildId, cid, mid, interactionId) VALUES (?, ?, ?, ?)`, [message.guild.id, message.channel.id, init.id, Interaction.id]);
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