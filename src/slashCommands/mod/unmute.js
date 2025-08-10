const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: "unmute",
    description: "Un-mute a user",
    botPermissions: [PermissionFlagsBits.ModerateMembers],
    options: [{
        name: "user",
        description: "User to un-mute",
        type: ApplicationCommandOptionType.User,
        required: true
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args, con) => {
        if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const getMember = interaction.options.getMember('user');
            const checkPos = modFuncs.comparePos(getMember, interaction);
            if (checkPos) return interaction.reply("That person has a role with a higher or the same position as you or me");
            if (interaction.member.bot) return interaction.reply("Can't mute a bot.");
            getMember.timeout(null).catch(console.error);
            modFuncs.sendLog("Un-mute", interaction, getMember, `No reason provided`);
        }
    }
};