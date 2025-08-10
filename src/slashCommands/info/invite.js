const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "invite",
    description: "Gives an invite for the bot",
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
                { name: "Invite", value: `[Click here](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=277495540982&scope=bot%20applications.commands)`, inline: false }
            ]);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};