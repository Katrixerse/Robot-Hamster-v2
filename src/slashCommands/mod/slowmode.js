const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, version, PermissionFlagsBits } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");
const ms = require('ms');

module.exports = {
    name: "slowmode",
    description: "Sets the channel slowmode",
    botPermissions: [PermissionFlagsBits.ManageMessages],
    options: [{
        name: "seconds",
        description: "Amount of seconds to set slowmode to",
        type: ApplicationCommandOptionType.Integer,
        required: true
    }, {
        name: "reason",
        description: "A reason for the slowmode (Optional)",
        type: ApplicationCommandOptionType.String,
        required: false
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args, con) => {
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const getTime = interaction.options.getInteger("seconds");
            const getReason = interaction.options.getInteger("reason") || "No reason provided";
            if (isNaN(getTime)) return interaction.reply(message, "Not a valid time. (Example: 30)");
            if (getTime < 2 || getTime >= 100) return interaction.reply(`Min/Max seconds is 1/21600.`);
            interaction.channel.setRateLimitPerUser(parseInt(getTime), getReason);
            interaction.reply("Slowmode is now enabled for this channel");
            modFuncs.sendLog("Slowmode", interaction, "none", getReason);
        }
    }
};