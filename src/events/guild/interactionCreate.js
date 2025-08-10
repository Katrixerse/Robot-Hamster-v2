const { PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, PermissionsBitField } = require("discord.js");
const Ticket = require("../../handlers/handleTickets");
const { con } = require("../../functions/dbConnection.js");
module.exports = async (bot, interaction) => {
    if (interaction.inGuild()) {
        if (!interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ViewChannel)) return;
        if (interaction.isCommand()) {

            const args = [];

            for (const option of interaction.options.data) {
                if (option.type === 'SUB_COMMAND') {
                    if (option.name) args.push(option.name);
                    option.options?.forEach(x => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) {
                    args.push(option.value);
                }
            }

            if (!interaction.isRepliable()) return interaction.reply({ content: "Command can only be run in a server", ephemeral: true });
            const command = bot.slashCommands.get(interaction.commandName);
            if (command.botPermissions != [] && command.botPermissions != 'none') {
                if (!interaction.guild.members.me.permissions.has(command.botPermissions)) {
                    const permissions = new PermissionsBitField(command.botPermissions).toArray();
                    return interaction.reply(`I am missing the following permission(s): ${permissions.join(", ")}`);
                }
            }
            if (command) {
                try {
                    console.log(`[(Slash command) (${interaction.guild.members.me.user.username}) (${interaction.guild.name}) (${interaction.user.username}) (${interaction.commandName}) (${args.length == 0 ? "No args detected." : args.join(' ').substring(0, 25)})]`);
                    await command.run(bot, interaction, args, con);
                } catch (error) {
                    console.error(`Error executing ${interaction.commandName}`);
                    console.error(error);
                }
            }
        }
        if (interaction.isButton()) {
            con.query(`SELECT * FROM serverTicketReaction WHERE guildId="${interaction.guild.id}" AND cid="${interaction.channel.id}"`, async (e, rows) => {
                if (!rows || rows.length == 0) return;
                rows = rows[0];
                const getEmbed = await interaction.channel.messages.fetch(rows.mid);
                if (!getEmbed) return con.query(`DELETE FROM serverTicketReaction WHERE guildId ="${interaction.guild.id}" AND cid="${interaction.channel.id}"`);
                if (!getEmbed?.embeds[0].title.includes("Open Ticket")) return;
                if (rows.mid === getEmbed.id) {
                    const modal = new ModalBuilder()
                        .setCustomId('ticketModal')
                        .setTitle('Open a ticket');

                    const reasonInput = new TextInputBuilder()
                        .setCustomId('reasonInput')
                        .setLabel("Reason for opening a ticket:")
                        .setMaxLength(2000)
                        // Paragraph means multiple lines of text.
                        .setStyle(TextInputStyle.Paragraph);

                    const reasonInputRow = new ActionRowBuilder().addComponents(reasonInput);

                    // Add inputs to the modal
                    modal.addComponents(reasonInputRow);

                    // Show the modal to the user
                    await interaction.showModal(modal);

                    const submitted = await interaction.awaitModalSubmit({
                        time: 180000,
                        filter: i => i.user.id === interaction.user.id,
                    }).catch(error => {
                        return;
                    });

                    if (submitted) {
                        const getReason = submitted.fields.getTextInputValue("reasonInput");
                        const ticket = new Ticket(interaction, con, getReason, interaction.member);
                        ticket.create();
                        if (interaction.isRepliable()) interaction.reply({ content: "Ticket created!", ephemeral: true });
                    }
                }
            });
        }
    }
};