const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: "warn",
    description: "Warn a user",
    botPermissions: ['none'],
    options: [{
        name: "user",
        description: "User to warn",
        type: ApplicationCommandOptionType.User,
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
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const getMember = interaction.options.getMember('user');
            if (getMember.user.bot) return interaction.reply({ content: "You can't warn a bot!", ephemeral: true });
            const checkPos = modFuncs.comparePos(getMember, interaction);
            if (checkPos) return interaction.reply("That person has a role with a higher or the same position as you or me");
            if (interaction.member.bot) return interaction.reply("Can't warn a bot.");
            const res = interaction.options.getString('reason');
            if (res.length > 128) return interaction.reply('Reason is too long. (Max length is 128 Characters)');
            con.query(`SELECT * FROM warnings WHERE guildId="${interaction.member.guild.id}" AND userId="${interaction.member.id}"`, (err, rows) =>
            {
                if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                if (rows)
                {
                    if (rows.length >= 30) return interaction.reply(interaction, "That member has too many warns. (30)");
                }
            });
            const date = new Date();
            con.query("INSERT INTO warnings (guildId, userId, warn_reason, warn_date, warned_by) VALUES (?, ?, ?, ?, ?)", [interaction.member.guild.id, getMember.id, con.escape(res), date.toDateString(), interaction.member.displayName]);
            modFuncs.updateCn(interaction);
            con.query(`SELECT casen.cn, sr.warnMessage FROM casenumber as casen LEFT JOIN serverResponses as sr ON sr.guildId = casen.guildId WHERE casen.guildId="${interaction.member.guild.id}"`, (err, row) =>
            {
                if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                row = row[0];
                interaction.reply({ content: `${row.warnMessage.replace('%USER%', getMember.displayName).replace('%GUILDNAME%', interaction.guild.name).replace('%REASON%', res.substring(0, 1023))}` });
                modFuncs.sendLog("Warning", interaction, getMember, res);
            });
        }
    }
};