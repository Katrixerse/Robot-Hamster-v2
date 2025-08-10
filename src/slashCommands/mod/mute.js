const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
const ms = require("ms");

module.exports = {
    name: "mute",
    description: "Mute a user",
    botPermissions: [PermissionFlagsBits.ModerateMembers],
    options: [{
        name: "user",
        description: "User to mute",
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: "time",
        description: "Time to mute (Example: 30s, 1m, 2h, 1d)",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "reason",
        description: "Reason for the warn",
        type: ApplicationCommandOptionType.String,
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
            const time = interaction.options.getString('time');
            if (!time.endsWith("s") && !time.endsWith("m") && !time.endsWith("h") && !time.endsWith("d")) return interaction.reply("Not a valid time. (Example: 30s, 1m, 2h, 1d)");
            if (ms(time) >= 2419200000) return interaction.reply("Can't mute for more than 28 days.");
            const res = interaction.options.getString('reason');
            if (res.length > 128) return interaction.reply('Reason is too long. (Max length is 128 Characters)');
            con.query(`SELECT muteMessage FROM serverResponses WHERE guildId="${interaction.guild.id}"`, (err, row) => {
                if (row) {
                    row = row[0];
                    getMember.timeout(parseInt(ms(time), res)).then(user => interaction.reply(`${row.muteMessage.replace('%USER%', user).replace('%GUILDNAME%', interaction.guild.name).replace('%REASON%', res.substring(0, 1023))}`)).catch(console.error);
                    modFuncs.sendLog("Mute", interaction, getMember, res);
                }
            });
        }
    }
};