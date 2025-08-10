const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "vote",
    description: "Gives an link to vote for the bot",
    botPermissions: ['none'],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .addFields([
                { name: "Vote", value: `[Click here](https://top.gg/bot/491699193585467393/vote)`, inline: false }
            ]);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};