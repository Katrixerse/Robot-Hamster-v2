const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

const sendPurgeLog = (message, messages, purgeMethod) => {
    modFuncs.updateCn(message);
    con.query(`SELECT * FROM casenumber WHERE guildId="${message.guild.id}"`, (err, row) => {
        if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        row = row[0];
        const embed = new EmbedBuilder()
            .setTitle(`Messages Purged`)
            .setTimestamp()
            .setColor(`#F49A32`)
            .addFields([
                { name: `Purged By:`, value: `${message.author.tag} (${message.author.id})` },
                { name: `Purged:`, value: `${purgeMethod}` },
                { name: `Channel:`, value: `${message.channel.name} (${message.channel.id})` },
                { name: `Amount:`, value: `${messages.length}` },
                { name: `Case number:`, value: `${row.cn}` }
            ]);
        modFuncs.sendToModChannel(message, embed);
    });
};


module.exports = {
    name: 'purge',
    aliases: ["purge"],
    description: 'Allows Staff to purge messages',
    usage: 'purge',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const components = (state) => {
                ih.create_row();

                ih.makeNewButtonInteraction("Purge a user", ButtonStyle.Primary, state, "purgeUser");

                ih.makeNewButtonInteraction("Purge a bot", ButtonStyle.Primary, state, "purgeBot");

                ih.makeNewButtonInteraction("Purge string", ButtonStyle.Primary, state, "purgeString");

                ih.makeNewButtonInteraction("Purge everything", ButtonStyle.Primary, state, "purgeEverything");

                const row = ih.return_row();

                return [row];
            };

            const status = ["**Waiting for input..**"];

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

            const init = await message.channel.send({
                embeds: [embed],
                components: components(false)
            });

            const filter = m => m.author.id === message.author.id;

            const on_collect = (Interaction, collector) => {
                if (Interaction.customId == "purgeUser") {
                    status.push("**:warning: Waiting for you to enter a user.. :warning:**");

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                    Interaction.update({
                        embeds: [embed],
                        components: components(false)
                    });

                    message.channel.awaitMessages({
                        filter,
                        time: 60000,
                        max: 1
                    }).then(resp => {
                        resp = resp.first();
                        const user = resp.mentions.members.first() || message.guild.members.cache.get(resp.content);
                        if (!user) return mainFuncs.send(message, "User wasn't found, please try again.");

                        status.push("**:warning: Waiting for you to enter an amount.. :warning:**");

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                        if (init.editable) init.edit({ embeds: [embed] });

                        message.channel.awaitMessages({
                            filter,
                            time: 60000,
                            max: 1
                        }).then(async msgCount => {
                            msgCount = msgCount.first();

                            if (parseInt(msgCount.content) > 100) return mainFuncs.send(message, "Can't purge more than 100 messages at a time.");
                            if (parseInt(msgCount.content) < 3) return mainFuncs.send(message, "Can't purge less than 3 messages at a time.");

                            await message.channel.messages.fetch({
                                limit: 100
                            }).then(async messages => {
                                messages = messages.filter(m => m.author.id == user.id && m.id != init.id).first(parseInt(msgCount.content));
                                if (messages.length == 0) return mainFuncs.send(message, "User has no messages to purge.");
                                message.channel.bulkDelete(messages, true).catch((e) => {
                                    return mainFuncs.send(message, "Error: ${e.message}");
                                });
                                status.push(`**:white_check_mark: Successfully purged ${messages.length} message(s). :white_check_mark:**`);
                                sendPurgeLog(message, messages, `User: ${user.user.username}`);
                            }).catch(console.error);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                            if (init.editable) init.edit({ embeds: [embed] });
                        }).catch(() => {
                            const embed1 = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**You ran out of time.**`);

                            if (init.editable) init.edit({ embeds: [embed1] });
                        });
                    });
                } else if (Interaction.customId == "purgeBot") {
                    status.push("**:warning: Waiting for you to enter a user.. :warning:**");

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                    Interaction.update({
                        embeds: [embed],
                        components: components(false)
                    });

                    message.channel.awaitMessages({
                        filter,
                        time: 60000,
                        max: 1
                    }).then(resp => {
                        resp = resp.first();
                        const user = resp.mentions.members.first() || message.guild.members.cache.get(resp.content);
                        if (!user) return mainFuncs.send(message, "Bot wasn't found, please try again.");
                        if (!user.bot) return mainFuncs.send(message, "Bot wasn't found, please try again.");

                        status.push("**:warning: Waiting for you to enter an amount.. :warning:**");

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                        if (init.editable) init.edit({ embeds: [embed] });

                        message.channel.awaitMessages({
                            filter,
                            time: 60000,
                            max: 1
                        }).then(async msgCount => {
                            msgCount = msgCount.first();

                            if (parseInt(msgCount.content) > 100) return mainFuncs.send(message, "Can't purge more than 100 messages at a time.");
                            if (parseInt(msgCount.content) < 3) return mainFuncs.send(message, "Can't purge less than 3 messages at a time.");

                            await message.channel.messages.fetch({
                                limit: 100
                            }).then(async messages => {
                                if (user.id == bot.user.id) return mainFuncs.send(message, "Can't purge my own messages, please use clean command instead.");
                                messages = messages.filter(m => m.author.id == user.id && m.author.bot && m.id != init.id).first(parseInt(msgCount.content));
                                if (messages.length == 0) return mainFuncs.send(message, "User has no messages to purge.");
                                message.channel.bulkDelete(messages, true).catch((e) => {
                                    return mainFuncs.send(message, "Error: ${e.message}");
                                });
                                status.push(`**:white_check_mark: Successfully purged ${messages.length} message(s). :white_check_mark:**`);
                                sendPurgeLog(message, messages, `Bot: ${user.user.username}`);
                            }).catch(console.error);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                            if (init.editable) init.edit({ embeds: [embed] });
                        }).catch(() => {
                            const embed1 = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**You ran out of time.**`);

                            if (init.editable) init.edit({ embeds: [embed1] });
                        });
                    });
                } else if (Interaction.customId == "purgeString") {
                    status.push("**:warning: Waiting for you to enter a string.. :warning:**");

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**Purge**__\n\n**What would you like to purge?**__\n\n__**STATUS**__\n${status.join("\n")}`);

                    Interaction.update({
                        embeds: [embed],
                        components: components(false)
                    });

                    message.channel.awaitMessages({
                        filter,
                        time: 60000,
                        max: 1
                    }).then(resp => {
                        resp = resp.first();
                        const getString = resp.content;
                        if (!getString) return mainFuncs.send(message, "No string was found to purge by.");

                        status.push("**:warning: Waiting for you to enter an amount.. :warning:**");

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                        if (init.editable) init.edit({ embeds: [embed] });

                        message.channel.awaitMessages({
                            filter,
                            time: 60000,
                            max: 1
                        }).then(async msgCount => {
                            msgCount = msgCount.first();

                            if (parseInt(msgCount.content) > 100) return mainFuncs.send(message, "Can't purge more than 100 messages at a time.");
                            if (parseInt(msgCount.content) < 3) return mainFuncs.send(message, "Can't purge less than 3 messages at a time.");

                            await message.channel.messages.fetch({
                                limit: 100
                            }).then(async messages => {
                                messages = messages.filter(m => m.content == getString && m.id != init.id).first(parseInt(msgCount.content));
                                if (messages.length == 0) return mainFuncs.send(message, "User has no messages to purge.");
                                message.channel.bulkDelete(messages, true).catch((e) => {
                                    return mainFuncs.send(message, "Error: ${e.message}");
                                });
                                status.push(`**:white_check_mark: Successfully purged ${messages.length} message(s). :white_check_mark:**`);
                                sendPurgeLog(message, messages, `String matching: ${getString}`);
                            }).catch(console.error);

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`__**Purge**__\n\n**What would you live to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                            if (init.editable) init.edit({ embeds: [embed] });
                        }).catch(() => {
                            const embed1 = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**You ran out of time.**`);

                            if (init.editable) init.edit({ embeds: [embed1] });
                        });
                    });
                } else if (Interaction.customId == "purgeEverything") {
                    status.push("**:warning: Waiting for you to enter an amount.. :warning:**");

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**Purge**__\n\n**What would you like to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                    Interaction.update({ embeds: [embed] });

                    message.channel.awaitMessages({
                        filter,
                        time: 60000,
                        max: 1
                    }).then(async msgCount => {
                        msgCount = msgCount.first();

                        if (parseInt(msgCount.content) > 100) return mainFuncs.send(message, "Can't purge more than 100 messages at a time.");
                        if (parseInt(msgCount.content) < 3) return mainFuncs.send(message, "Can't purge less than 3 messages at a time.");

                        await message.channel.messages.fetch({
                            limit: 100
                        }).then(async messages => {
                            messages = messages.filter(m => m.id != init.id).first(parseInt(msgCount.content));
                            if (messages.length == 0) return mainFuncs.send(message, "User has no messages to purge.");
                            message.channel.bulkDelete(messages, true).catch((e) => {
                                return mainFuncs.send(message, `Error: ${e.message}`);
                            });
                            status.push(`**:white_check_mark: Successfully purged ${messages.length} message(s). :white_check_mark:**`);
                            sendPurgeLog(message, messages, "Everything");
                        }).catch(console.error);

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Purge**__\n\n**What would you live to purge?**\n\n__**STATUS**__\n${status.join("\n")}`);

                        if (init.editable) init.edit({ embeds: [embed] });
                    }).catch(() => {
                        const embed1 = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**You ran out of time.**`);

                        if (init.editable) init.edit({ embeds: [embed1] });
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