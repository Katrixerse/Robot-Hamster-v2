const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");

module.exports = {
    name: "staffonly",
    description: "Set the bot to respond to staff only",
    botPermissions: ['none'],
    options: [{
        name: "toggle",
        description: "Enable or disable staff only mode",
        type: ApplicationCommandOptionType.String,
        required: true
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            const getToggle = interaction.options.getString("toggle");
            if (getToggle == "enable" || getToggle == "disable") {
                con.query(`UPDATE serverSettings SET modOnlyCommands="${con.escape(getToggle)}" WHERE guildId="${interaction.guild.id}"`);
                return interaction.reply(`Staff only mode has been ${getToggle}d.`);
            } else {
                return interaction.reply(`Invalid option.`);
            }
        }
    }
};