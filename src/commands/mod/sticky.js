const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
const IH = require("../../handlers/interactions").IH;
module.exports = {
    name: 'sticky',
    aliases: ["sticky"],
    description: 'Manage sticky messages',
    usage: 'stk',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageMessages],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const embedLimit = new EmbedBuilder()
                .setTitle('Sticky message')
                .setDescription(`Hey you hit the sticky message limit, please delete some other ones.`)
                .setColor(`#F49A32`);

            con.query(`SELECT * FROM serverStickyMessages WHERE guildId = "${message.guild.id}" AND channelId = "${message.channel.id}"`, async (e, row) => {
                if (row.length >= 8) return message.channel.send({ embeds: [embedLimit] });
                row = row[0];
                if (!row) {

                    const ih = new IH(message);

                    const components = (state) => {
                        ih.create_row();

                        ih.makeNewButtonInteraction("Create sticky", ButtonStyle.Primary, state, "createNew");

                        const row = ih.return_row();

                        return [row];
                    };

                    const status = ["**Waiting for input..**"];

                    const embed = new EmbedBuilder()
                        .setColor(`#F49A32`)
                        .addFields([
                            { name: `__**Sticky messages**__\n\n`, value: `\`\`\`\Markdown:\nBold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\`\nTo unsticky the message run this command again.\n\n__**STATUS**__\n${status.join("\n")}` }
                        ]);
                    const init = await message.channel.send({
                        embeds: [embed],
                        components: components(false)
                    });

                    const filter = m => m.author.id === message.author.id;

                    const on_collect = (Interaction, collector) => {

                        if (Interaction.customId == "createNew") {
                            collector.stop("artificial");

                            status.push("**:warning: Waiting for you to enter a message.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(`#F49A32`)
                                .addFields([
                                    { name: `__**Sticky messages**__\n\n`, value: `\`\`\`\Markdown:\nBold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\`\n\n__**STATUS**__\n${status.join("\n")}` }
                                ]);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(async resp => {
                                resp = resp.first();

                                if (resp.content.length > 256) return mainFuncs.send(message, "Sticky message can't be longer than 256 characters.");

                                const successEmbed = new EmbedBuilder()
                                    .addFields([
                                        { name: `__**Sticky message**__\n\n`, value: `${resp.content}` }
                                    ])
                                    .setColor(`#F49A32`);

                                const { id } = await message.channel.send({ embeds: [successEmbed] });

                                con.promise().query(`INSERT INTO serverStickyMessages (guildId, channelId, messageContent, isEmbeded, messagesBeforeSticky, lastStickyMessage) VALUES (?, ?, ?, ?, ?, ?)`, [message.guild.id, message.channel.id, 'none', 'yes', 5, id]);
                                con.promise().query(`UPDATE serverStickyMessages SET messageContent = ${con.escape(resp.content)}, lastStickyMessage = "${id}" WHERE guildId = "${message.guild.id}" AND channelId = "${message.channel.id}"`);

                                status.push("**:white_check_mark: Successfully set sticky message. :white_check_mark:**");

                                const embed = new EmbedBuilder()
                                    .setColor(`#F49A32`)
                                    .addFields([
                                        { name: `__**Sticky messages**__\n\n`, value: `\`\`\`\Markdown:\nBold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\`\n\n__**STATUS**__\n${status.join("\n")}` }
                                    ]);

                                if (init.editable) init.edit({ embeds: [embed] });
                            }).catch((err) => {
                                console.log(err);
                                const embed1 = new EmbedBuilder()
                                    .setColor(`#F49A32`)
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
                } else {
                    const ih = new IH(message);

                    const components = (state) => {
                        ih.create_row();

                        ih.makeNewButtonInteraction("Update", ButtonStyle.Primary, state, "updateSticky");

                        ih.makeNewButtonInteraction("Delete", ButtonStyle.Primary, state, "deleteSticky");

                        const row = ih.return_row();

                        return [row];
                    };

                    const status = ["**Waiting for input..**"];

                    const embed = new EmbedBuilder()
                        .setColor(`#F49A32`)
                        .addFields([
                            { name: `__**Sticky messages**__\n\n`, value: `\`\`\`\Markdown:\nBold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\`\n\n__**STATUS**__\n${status.join("\n")}` }
                        ]);

                    const init = await message.channel.send({
                        embeds: [embed],
                        components: components(false)
                    });

                    const filter = m => m.author.id === message.author.id;

                    const on_collect = (Interaction, collector) => {

                        if (Interaction.customId == "updateSticky") {
                            collector.stop("artificial");

                            status.push("**:warning: Waiting for you to enter a message.. :warning:**");

                            const embed = new EmbedBuilder()
                                .setColor(`#F49A32`)
                                .addFields([
                                    { name: `__**Sticky messages**__\n\n`, value: `\`\`\`\Markdown:\nBold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\`\n\n__**STATUS**__\n${status.join("\n")}` }
                                ]);

                            Interaction.update({
                                embeds: [embed]
                            });

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(async resp => {
                                resp = resp.first();

                                const check = resp.content.replace(/[^\x00-\x7F]/g, "");
                                if (check.length < 1) return mainFuncs.send(message, "Password can't have ASCII characters.");

                                if (resp.content.length > 256) return mainFuncs.send(message, "Sticky message can't be longer than 256 characters.");

                                const successEmbed = new EmbedBuilder()
                                .addFields([
                                    { name: `__**Sticky message**__\n\n`, value: `${resp.content}` }
                                ])
                                .setColor(`#F49A32`);

                                if (message && message.deletable) {
                                    message.delete();
                                }
                                const { id } = await message.channel.send({ embeds: [successEmbed] });

                                con.promise().query(`UPDATE serverStickyMessages SET messageContent = ${con.escape(resp.content)}, lastStickyMessage = "${id}" WHERE guildId = "${message.guild.id}" AND channelId = "${message.channel.id}"`);

                                status.push("**:white_check_mark: Successfully updated sticky message. :white_check_mark:**");

                                const embed = new EmbedBuilder()
                                    .setColor(`#F49A32`)
                                    .addFields([
                                        { name: `__**Sticky messages**__\n\n`, value: `\`\`\`\Markdown:\nBold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\`\n\n__**STATUS**__\n${status.join("\n")}` }
                                    ]);

                                if (init.editable) init.edit({ embeds: [embed] });
                            }).catch((err) => {
                                console.log(err);
                                const embed1 = new EmbedBuilder()
                                    .setColor(`#F49A32`)
                                    .setDescription(`**You ran out of time.**`);

                                if (init.editable) init.edit({ embeds: [embed1] });
                            });
                        } else if (Interaction.customId == "deleteSticky") {
                            collector.stop("artificial");

                            con.query(`SELECT * FROM serverStickyMessages WHERE guildId = "${message.guild.id}" AND channelId = "${message.channel.id}"`, async (e, row) => {
                                if (!row || row.length === 0) return mainFuncs.send(message, "No sticky messages have been set up in this channel.");
                                row = row[0];
                                con.query(`DELETE FROM serverStickyMessages WHERE guildId="${row.guildId}" AND channelId ="${row.channelId}"`);
                            });

                            status.push("**:white_check_mark: Successfully deleted sticky message. :white_check_mark:**");

                            const embed = new EmbedBuilder()
                                .setColor(`#F49A32`)
                                .addFields([
                                    { name: `__**Sticky messages**__\n\n`, value: `\`\`\`\Markdown:\nBold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\`\n\n__**STATUS**__\n${status.join("\n")}` }
                                ]);

                            Interaction.update({
                                embeds: [embed],
                                components: []
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
        });
    }
};