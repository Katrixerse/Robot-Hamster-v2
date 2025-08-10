const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");
const Ticket = require("../../handlers/handleTickets");
module.exports = {
    name: 'maketicket',
    aliases: ["mkt"],
    description: 'Create a ticket',
    usage: 'maketicket',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    run: async (bot, prefix, message, args, con) => {
        const IH = require("../../handlers/interactions").IH;

        const ih = new IH(message);

        let reason = "User did not specify a reason.";
        const status = ["**Waiting for input..**"];

        const embed = new EmbedBuilder()
            .setColor(0x0000ff)
            .setDescription(`__**TICKETS**__\n\n**Current reason:** __${reason}__\n\n__**STATUS**__\n${status.join("\n")}`);

        const components = (state) => {
            ih.create_row();

            ih.makeNewButtonInteraction("Submit ticket", ButtonStyle.Success, state, "submit", "✅");

            ih.makeNewButtonInteraction("Change reason", ButtonStyle.Primary, state, "reason", "📝");

            const row = ih.return_row();

            return [row];
        };

        const init = await message.channel.send({
            embeds: [embed],
            components: components(false)
        });

        const on_collect = (Interaction, collector) => {
            if (Interaction.customId == "reason") {
                status.push("**:warning: Waiting for you to enter a reason.. :warning:**");

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`__**TICKETS**__\n\n**Current reason:** __${reason}__\n\n__**STATUS**__\n${status.join("\n")}`);

                Interaction.update({
                    embeds: [embed]
                });

                const filter = m => m.author.id == message.author.id;

                message.channel.awaitMessages({
                    filter,
                    time: 60000,
                    max: 1
                }).then(resp => {
                    resp = resp.first().content;

                    status.push("**:white_check_mark: Reason updated :white_check_mark:**");

                    reason = resp;

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**TICKETS**__\n\n**Current reason:** __${reason}__\n\n__**STATUS**__\n${status.join("\n")}`);

                    if (init.editable) init.edit({ embeds: [embed] });

                }).catch(() => {
                    const embed1 = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`**You ran out of time.**`);

                    if (init.editable) init.edit({ embeds: [embed1] });
                });
            } else {
                const embed1 = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Ticked submitted!**`);

                Interaction.update({
                    embeds: [embed1],
                    components: []
                });

                const subject = reason;

                const ticket = new Ticket(message, con, subject);

                ticket.create();
            }
        };

        const on_end = reason => {
            if (init.editable) init.edit({ components: components(true) });
        };

        ih.create_collector(on_collect, on_end, init);
    }
};