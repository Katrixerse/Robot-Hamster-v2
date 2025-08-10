const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: "warns",
    description: "View a users warnings",
    botPermissions: [PermissionFlagsBits.ManageMessages],
    options: [{
        name: "user",
        description: "User to view their warnings",
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
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const getMember = interaction.options.getMember('user');
            const checkPos = modFuncs.comparePos(getMember, interaction);
            if (checkPos) return interaction.reply("That person has a role with a higher or the same position as you or me");
            if (interaction.member.bot) return interaction.reply("Can't warn a bot.");
            con.query(`SELECT * FROM warnings WHERE guildId="${interaction.guild.id}" AND userId="${getMember.id}"`, (err, rows) => {
                if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                if (!rows || rows.length == 0) return interaction.reply("User has no warnings");
                let text_to_send = ["\`\`\`\n"];
                rows.forEach((row, i) => {
                    const index = i + 1;
                    text_to_send.push(`Warning ${index}.\nReason: ${row.warn_reason}\nDate: ${row.warn_date}\nWarned by: ${row.warned_by}\n`);
                });
                text_to_send.push("\`\`\`");
                text_to_send = text_to_send.join("\n");
                const embed = new EmbedBuilder()
                    .setTitle(`Warnings for ${interaction.member.displayName}`)
                    .setDescription(text_to_send)
                    .setColor(`#F49A32`);
                return interaction.reply({ embeds: [embed] });
            });
        }
    }
};