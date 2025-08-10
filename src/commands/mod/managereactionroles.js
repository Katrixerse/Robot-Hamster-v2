const { EmbedBuilder, Message, ButtonStyle, PermissionFlagsBits, Embed } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'managereactionroles',
    aliases: ["mrr"],
    description: 'Manage reaction roles',
    usage: 'mrr',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const status = ["**Waiting for input..**"];

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**Reaction Roles**__\n\n**Please select an option.**\n\n__**Status**__\n${status.join('\n')}`);

            con.query(`SELECT messageId FROM serverReactionRoles WHERE guildId="${message.guild.id}" AND channelId="${message.channel.id}"`, async (e, rows) => {
                const components = async (state) => {
                    let available = false;
                    let mesa;
                    if (rows && rows.length > 0) {
                        const messages = await message.channel.messages.fetch();
                        const mes = messages.get(rows[0].messageId);
                        if (mes) { available = true; mesa = mes; }
                    }

                    ih.create_row();

                    ih.makeNewButtonInteraction(`Add a reaction role`, ButtonStyle.Primary, state, `add`);

                    ih.makeNewButtonInteraction(`Remove a reaction role`, ButtonStyle.Primary, state, `remove`);

                    ih.makeNewButtonInteraction(`View all reaction roles`, ButtonStyle.Primary, state, `view`);

                    ih.makeNewButtonInteraction(`Go to the reaction roles message`, !mesa ? ButtonStyle.Secondary : ButtonStyle.Link, state || !available, !mesa ? "goToReaction" : undefined, undefined, !mesa ? undefined : mesa.url);

                    const row = ih.return_row();

                    return [row];
                };

                const init = await message.channel.send({
                    embeds: [embed],
                    components: await components(false)
                });

                const on_collect = async (Interaction, collector) => {
                    if (Interaction.customId == "add") {
                        let cur_emoji = "_";
                        let cur_role;
                        let cur_channel;

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Reaction Roles**__\n\n**Current emoji:** __${cur_emoji}__\n**Current role:** __${cur_role == undefined ? "none" : cur_role}__\n**Current channel:**__${cur_channel == undefined ? "none" : cur_channel}__ \n\n__**Status**__\n${status.join('\n')}`);

                        const components = (state) => {
                            ih.create_row();

                            ih.makeNewButtonInteraction(`Change emoji`, ButtonStyle.Primary, state, `emoji`, "😃");

                            ih.makeNewButtonInteraction(`Change role`, ButtonStyle.Primary, state, `role`, "🔁");

                            ih.makeNewButtonInteraction(`Change channel`, ButtonStyle.Primary, state, `channel`, "🔂");

                            ih.makeNewButtonInteraction(`Create reaction role`, ButtonStyle.Success, state || cur_emoji == "_" || !cur_role || !cur_channel, `submit`, "✅");

                            const row = ih.return_row();

                            return [row];
                        };

                        await Interaction.update({
                            embeds: [embed],
                            components: components(false)
                        });

                        const filter = m => m.author.id === message.author.id;

                        const on_collect = async (Interaction, collector) => {
                            if (Interaction.customId == "emoji") {
                                status.push(`**Waiting for you to send an emoji..**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**Reaction Roles**__\n\n**Current emoji:** __${cur_emoji}__\n**Current role:** __${cur_role == undefined ? "none" : cur_role}__\n**Current channel:**__${cur_channel == undefined ? "none" : cur_channel}__ \n\n__**Status**__\n${status.join('\n')}`);

                                Interaction.update({
                                    embeds: [embed]
                                });

                                message.channel.awaitMessages({
                                    filter,
                                    time: 60000,
                                    max: 1
                                }).then(e => {
                                    e = e.first().content;

                                    const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
                                    const valid = bot.emojis.cache.find(em => em.name == e) || regex.test(e);
                                    if (valid) {
                                        cur_emoji = e;
                                        status.push(`**Emoji updated.**`);

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(`__**Reaction Roles**__\n\n**Current emoji:** __${cur_emoji}__\n**Current role:** __${cur_role == undefined ? "none" : cur_role}__\n**Current channel:**__${cur_channel == undefined ? "none" : cur_channel}__ \n\n__**Status**__\n${status.join('\n')}`);

                                        if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                                    } else {
                                        collector.stop("artificial");
                                        return mainFuncs.send(message, "Not a valid emoji");
                                    }
                                }).catch(() => {
                                    const embed1 = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**You ran out of time.**`);

                                    if (init.editable) init.edit({ embeds: [embed1] });
                                });
                            } else if (Interaction.customId == "role") {
                                status.push(`**Waiting for you to send the role name..**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**Reaction Roles**__\n\n**Current emoji:** __${cur_emoji}__\n**Current role:** __${cur_role == undefined ? "none" : cur_role}__\n**Current channel:**__${cur_channel == undefined ? "none" : cur_channel}__ \n\n__**Status**__\n${status.join('\n')}`);

                                Interaction.update({
                                    embeds: [embed]
                                });

                                message.channel.awaitMessages({
                                    filter,
                                    time: 60000,
                                    max: 1
                                }).then(r => {
                                    r = r.first().content;
                                    const finderrole = message.guild.roles.cache.find(ro => ro.name == r);
                                    if (!finderrole || !finderrole.editable) {
                                        collector.stop("artificial");
                                        return mainFuncs.send(message, "Not a valid role or the role is higher than me.");
                                    }

                                    cur_role = finderrole;

                                    status.push(`**Role updated.**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`__**Reaction Roles**__\n\n**Current emoji:** __${cur_emoji}__\n**Current role:** __${cur_role == undefined ? "none" : cur_role}__\n**Current channel:**__${cur_channel == undefined ? "none" : cur_channel}__ \n\n__**Status**__\n${status.join('\n')}`);

                                    if (init.editable) init.edit({ embeds: [embed], components: components(false) });
                                }).catch(() => {
                                    const embed1 = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**You ran out of time.**`);

                                    if (init.editable) init.edit({ embeds: [embed1] });
                                });
                            } else if (Interaction.customId == "channel") {
                                status.push(`**Waiting for you to send the channel name..**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`__**Reaction Roles**__\n\n**Current emoji:** __${cur_emoji}__\n**Current role:** __${cur_role == undefined ? "none" : cur_role}__\n**Current channel:**__${cur_channel == undefined ? "none" : cur_channel}__ \n\n__**Status**__\n${status.join('\n')}`);

                                Interaction.update({
                                    embeds: [embed]
                                });

                                message.channel.awaitMessages({
                                    filter,
                                    time: 60000,
                                    max: 1
                                }).then(c => {
                                    c = c.first().content;
                                    const finder = message.guild.channels.cache.find(ch => ch.name == c);
                                    if (!finder) return mainFuncs.send(message, "Not a valid channel");

                                    cur_channel = finder;

                                    status.push(`**Channel updated.**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`__**Reaction Roles**__\n\n**Current emoji:** __${cur_emoji}__\n**Current role:** __${cur_role == undefined ? "none" : cur_role}__\n**Current channel:**__${cur_channel == undefined ? "none" : cur_channel}__ \n\n__**Status**__\n${status.join('\n')}`);

                                    if (init.editable) init.edit({ embeds: [embed], components: components(false) });

                                }).catch(() => {
                                    const embed1 = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**You ran out of time.**`);

                                    if (init.editable) init.edit({ embeds: [embed1] });
                                });
                            } else {

                                const embed = new EmbedBuilder()
                                    .setColor(0x00ff00)
                                    .setDescription(`**Reaction role added.**`);

                                await Interaction.update({
                                    components: [],
                                    embeds: [embed]
                                });

                                const messages = await cur_channel.messages.fetch();
                                const exists = messages.some(m => m.embeds.length > 0 && m.embeds[0].title == "Reaction Roles" && m.author.id == bot.user.id);
                                if (!exists) {
                                    const em = new EmbedBuilder()
                                        .setTimestamp()
                                        .setColor(`#F49A32`)
                                        .setTitle("Reaction Roles")
                                        .setDescription("React below to get a role!")
                                        .setThumbnail(bot.user.avatarURL())
                                        .addFields([
                                            { name: `${cur_emoji}`, value: `${cur_role.name}`, inline: true }
                                        ]);
                                    const m = await cur_channel.send({ embeds: [em] });
                                    m.react(cur_emoji);
                                    con.query("INSERT INTO serverReactionRoles (guildId, emojiName, channelId, messageId, roleName) VALUES (?, ?, ?, ?, ?)", [message.guild.id, cur_emoji, cur_channel.id, m.id, cur_role.name]);
                                } else {
                                    const mes = messages.find(m => m.embeds.length > 0 && m.embeds[0].title == "Reaction Roles" && m.author.id == bot.user.id);
                                    if (!mes) return;
                                    const em = mes.embeds[0];
                                    if (em.fields.some(f => f.name.startsWith(e))) {
                                        const embed = new EmbedBuilder()
                                            .setColor(0xff0000)
                                            .setDescription(`**That emoji already exists. Please use the command again.**`);

                                        await Interaction.update({
                                            components: [],
                                            embeds: [embed]
                                        });

                                        return collector.stop();
                                    }
                                    const newEmbed = EmbedBuilder.from(em).addFields([ { name: `${cur_emoji} for`, value: `${cur_role.name}`, inline: true } ]);
                                    if (mes.editable) mes.edit({ embeds: [newEmbed] });
                                    mes.react(cur_emoji);
                                    con.query("INSERT INTO serverReactionRoles (guildId, emojiName, channelId, messageId, roleName) VALUES (?, ?, ?, ?, ?)", [message.guild.id, cur_emoji, cur_channel.id, mes.id, cur_role.name]);
                                }

                                return collector.stop();
                            }
                        };

                        const on_end = reason => {
                            if (reason == "artificial");
                            if (init.editable) init.edit({ components: components(true) });
                        };

                        ih.create_collector(on_collect, on_end, init);

                        collector.stop("artificial");
                    } else if (Interaction.customId == "remove") {
                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**Please enter the emoji you would like to delete..**`);

                        await Interaction.update({
                            embeds: [embed],
                            components: []
                        });

                        const filter = m => m.author.id === message.author.id;

                        message.channel.awaitMessages({ filter, max: 1, errors: ["time"], time: 30000 }).then(e => {
                            e = e.first().content;
                            con.query(`SELECT * FROM serverReactionRoles WHERE guildId="${message.guild.id}" AND emojiName=${con.escape(e)}`, async (err, rows) => {
                                if (!rows || !rows[0]) return mainFuncs.send(message, "Emoji not found in reaction roles");
                                rows = rows[0];
                                con.query(`DELETE FROM serverReactionRoles WHERE guildId="${message.guild.id}" AND emojiName=${con.escape(e)}`);
                                mainFuncs.send(message, "Reaction role deleted");
                                const ch = message.guild.channels.cache.get(rows.channelId);
                                if (!ch) return;
                                const messages = await ch.messages.fetch();
                                const mes = messages.find(m => m.embeds.length > 0 && m.embeds[0].title == "Reaction Roles" && m.author.id == bot.user.id);
                                if (!mes) return;
                                const em = mes.embeds[0];
                                const newf = [];
                                em.fields.forEach(f => {
                                    if (!f.name.startsWith(e)) newf.push(f);
                                });
                                em.fields = [...newf];
                                if (em.fields.length <= 0) {
                                    if (mes && mes.deletable) { 
                                        mes.delete(); 
                                    }
                                }
                                if (mes.editable) mes.edit({ embeds: [em] });
                                const reaction = mes.reactions.cache.find(r => r.emoji.name == e);
                                if (!reaction) return;
                                reaction.users.remove(bot.user.id);
                            });

                        });
                    } else {
                        con.query(`SELECT * FROM serverReactionRoles WHERE guildId="${message.guild.id}"`, async (e, rows) => {
                            const rr = !rows || rows.length == 0 ? [{ emojiName: "No reaction roles found.", roleName: "" }] : rows;

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setTimestamp();

                            const text = [];

                            rr.forEach(r => {
                                if (r.emojiName.includes("No reaction")) {
                                    text.push(r.emojiName);
                                } else {
                                    text.push(`**Emoji:** ${r.emojiName} | **Role:** __${r.roleName}__`);
                                }
                            });

                            embed.setDescription(text.join("\n"));

                            await Interaction.update({
                                embeds: [embed],
                                components: []
                            });
                        });
                    }

                    collector.stop("artificial");
                };

                const on_end = async reason => {
                    if (reason == "artificial") return;
                    if (init.editable) init.edit({ components: await components(true) });
                };

                ih.create_collector(on_collect, on_end, init);
            });
        });
    }
};