const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'ticketoptions',
    aliases: ["tktopts"],
    description: 'Ticket options',
    usage: 'ticketoptions',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    run: async (bot, prefix, message, args, con) => {

        if (!message.channel.name.startsWith("ticket")) return mainFuncs.send(message, "This is not a ticket channel.");

        const embed = new EmbedBuilder()
            .setDescription(`**Ticket options**`)
            .setColor(0x0000ff);

        const components = (state, second_btn_visible = true, third_btn_visible = true, third_btn_disabled = false) => {
            const ButtonsArray = [];

            const CloseButton = new ButtonBuilder()
                .setCustomId("close")
                .setLabel("Close ticket")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(state)
                .setEmoji("❌");

            ButtonsArray.push(CloseButton);

            const CloseWithTranscriptButton = new ButtonBuilder()
                .setCustomId("close_t")
                .setLabel("Close ticket and get a transcript")
                .setStyle(ButtonStyle.Success)
                .setDisabled(state)
                .setEmoji("📝");

            if (second_btn_visible) ButtonsArray.push(CloseWithTranscriptButton);

            const ClaimButton = new ButtonBuilder()
                .setCustomId("claim")
                .setLabel("Claim this ticket")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(state || third_btn_disabled)
                .setEmoji("📥");

            if (third_btn_visible) ButtonsArray.push(ClaimButton);

            const ButtonsRow = new ActionRowBuilder();

            ButtonsRow.addComponents(ButtonsArray);

            return [ButtonsRow];
        };

        const messages = await message.channel.messages.fetch();
        const original_message = messages.find(m => m.embeds.length > 0 && m.embeds[0].description !== null && m.embeds[0].description.startsWith("•"));

        if (!original_message) {
            mainFuncs.send(message, "The original message the bot sent to this channel could not be found therefore it cannot be used.\nDeleting ticket data and channel in 1 minute, please save anything you need to.");
            con.query(`DELETE FROM serverOpenedTickets WHERE guildId="${message.guild.id}" AND channelId="${message.channel.id}"`);
            return setTimeout(() => {
                message.channel.delete();
            }, 60000);

        }

        const original_embed = original_message.embeds[0];
        const already_claimed = original_embed.description.includes("has been claimed");

        const initialMessage = await message.channel.send({
            embeds: [embed],
            components: components(false, true, true, already_claimed)
        });

        const filter = (Interaction) => Interaction.user.id === message.author.id;

        const collector = message.channel.createMessageComponentCollector({
            filter,
            time: 60000,
            message: initialMessage
        });

        try {
            collector.on("collect", async Interaction => {
                if (Interaction.customId == "close") {
                    collector.stop("artificial");
                    message.channel.delete();
                    const getUser = message.guild.members.cache.find(member => member.user.username.toLowerCase() === original_embed.fields[0].value.toLowerCase());
                    if (!getUser) return;
                    con.query(`SELECT * FROM serverOpenedTickets WHERE guildId ="${message.guild.id}" AND userId="${getUser.id}" LIMIT 1`, async (e, rows) => {
                        if (rows || rows.length >= 0) {
                            con.query(`DELETE FROM serverOpenedTickets WHERE guildId ="${message.guild.id}" AND userId="${getUser.id}"`);
                        }
                    });
                } else if (Interaction.customId == "close_t") {
                    let messages = await message.channel.messages.fetch();

                    let final = "";

                    messages = messages.sort((m1, m2) => m1.createdTimestamp - m2.createdTimestamp);

                    messages.forEach(message => {
                        if (message.author.bot) return;
                        if (message.content.length == 0) return;
                        final += `${message.author.username} - ${message.createdAt.toDateString()}\n${message.content}\n\n`;
                    });

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`Transcript added as an attachment. You can now download it and delete this ticket.`);

                    Interaction.update({
                        embeds: [embed],
                        files: [{ attachment: Buffer.from(final), name: "transcript.txt" }],
                        components: components(false, false, false, true)
                    });

                    const getUser = message.guild.members.cache.find(member => member.user.username.toLowerCase() === original_embed.fields[0].value.toLowerCase());
                    if (!getUser) return;
                    con.query(`SELECT * FROM serverOpenedTickets WHERE guildId ="${message.guild.id}" AND userId="${getUser.id}" LIMIT 1`, async (e, rows) => {
                        if (rows || rows.length >= 0) {
                            con.query(`DELETE FROM serverOpenedTickets WHERE guildId ="${message.guild.id}" AND userId="${getUser.id}"`);
                        }
                    });
                } else if (Interaction.customId == "claim") {
                    con.query(`SELECT * FROM serverTickets WHERE guildId ="${message.guild.id}" LIMIT 1`, async (e, rows) => {
                        const permOverwrites = [];

                        // MAKE IT SO NOBODY EXCEPT THE USER CLAIMING CAN TALK

                        const roles = rows[0].roles.split("|");

                        roles.forEach(role => {
                            const guildRole = message.guild.roles.cache.find(r => r.name == role);
                            if (!guildRole) return;
                            permOverwrites.push({
                                id: guildRole.id,
                                deny: [PermissionFlagsBits.SendMessages]
                            });
                        });

                        permOverwrites.push({
                            id: message.author.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
                        });

                        message.channel.edit({
                            permissionOverwrites: permOverwrites
                        });

                        const new_embed = new EmbedBuilder();
                        new_embed.setColor(0x0000ff);
                        new_embed.setDescription(original_embed.description.split("•")[1] + "\n" + `•Ticket has been claimed by ${message.author}` + original_embed.description.split("•")[3]);
                        new_embed.addFields(original_embed.fields);
                        new_embed.setTimestamp();

                        if (original_message.editable) original_message.edit({ embeds: [new_embed] });

                        Interaction.update({
                            components: components(false, true, true, true)
                        });
                    });
                }
            });
        } catch (err) {
            if (err.message == "Unknown interaction") return;
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }

        collector.on("end", (_, r) => {
            if (r == "artificial") return;
            if (initialMessage.editable) initialMessage.edit({ components: components(true, false, false, true) });
        });
    }
};