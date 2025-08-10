const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "avatar",
    description: "Get the avatar of a user",
    botPermissions: ['none'],
    options: [{
        name: "user",
        description: "username",
        type: ApplicationCommandOptionType.User,
        required: false
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        const member = interaction.options.getMember("user") || interaction;
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .setImage(member.user.displayAvatarURL({
                dynamic: true,
                size: 512
            }))
            .setURL(member.user.displayAvatarURL({
                dynamic: true,
                size: 512
            }))
            .setTitle(`Download`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};