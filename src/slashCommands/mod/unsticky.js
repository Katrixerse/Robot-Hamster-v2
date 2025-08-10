const { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");

module.exports = {
    name: "unsticky",
    description: "Unsticky a message from the channel",
    botPermissions: ['none'],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            con.query(`SELECT * FROM serverStickyMessages WHERE guildId = "${interaction.guild.id}" AND channelId = "${interaction.channel.id}"`, async (e, row) => {
                if (!row || row.length === 0) return interaction.reply("No sticky messages have been set up in this channel.");
                row = row[0];
                interaction.reply("Sticky successfully removed from this channel.");
                con.query(`DELETE FROM serverStickyMessages WHERE guildId="${row.guildId}" AND channelId ="${row.channelId}"`);
            });
        }
    }
};