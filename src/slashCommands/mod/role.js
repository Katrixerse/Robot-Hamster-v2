const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
const ms = require("ms");
const moment = require("moment");

module.exports = {
    name: "role",
    description: "Mute a user",
    botPermissions: [PermissionFlagsBits.ManageRoles],
    options: [{
        name: "user",
        description: "User to give the role to",
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: "role",
        description: "The role to give to the user",
        type: ApplicationCommandOptionType.Role,
        required: true
    },
    {
        name: "time",
        description: "Time to mute (Example: 30s, 1m, 2h, 1d)",
        type: ApplicationCommandOptionType.String,
        required: false
    },
    {
        name: "reason",
        description: "Reason for giving the role.",
        type: ApplicationCommandOptionType.String,
        required: false
    }
],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args, con) => {
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const getMember = interaction.options.getMember('user');
            const checkPos = modFuncs.comparePos(getMember, interaction);
            if (checkPos) return interaction.reply("That person has a role with a higher or the same position as you or me");
            if (interaction.member.bot) return interaction.reply("Can't give role to a bot.");
            const role = interaction.options.getRole('role');
            const time = interaction.options.getString('time');
            if (!time) {
                const res = interaction.options.getString('reason');
                if (res.length > 128) return interaction.reply('Reason is too long. (Max length is 128 Characters)');
                getMember.roles.add(role, res);
            } else {
            if (!time.endsWith("s") && !time.endsWith("m") && !time.endsWith("h") && !time.endsWith("d")) return interaction.reply("Not a valid time. (Example: 30s, 1m, 2h, 1d)");
            if (ms(time) >= 604800000) return interaction.reply("Timed role can't be longer than 7 days");
            const res = interaction.options.getString('reason');
            if (res && res.length > 128) return interaction.reply('Reason is too long. (Max length is 128 Characters)');
            con.query(`SELECT * FROM serverTimedRoles WHERE guildId="${interaction.guild.id}" AND userId="${getMember.id}"`, (err, row) => {
                if (!row || row.length == 0) {
                    const timeNOW = new Date().getTime();
                    const newTime = parseInt(timeNOW) + parseInt(ms(time));
                    row = row[0];
                    con.query(`INSERT INTO serverTimedRoles (guildId, userId, role, timeLeft) VALUES (?, ?, ?, ?)`, [interaction.guild.id, getMember.id, role.id, newTime]);
                    getMember.roles.add(role, res);
                    setTimeout(() => {
                        con.query(`DELETE FROM serverTimedRoles WHERE guildId="${interaction.guild.id}" AND userId="${getMember.id}"`);
                        getMember.roles.remove(role, res);
                    }, parseInt(ms(time)));
                    return interaction.reply(`${role.name} has been given to the user for ${time}.`);
                } else {
                    const timeNOW = new Date().getTime();
                    const getRole = interaction.guild.roles.cache.get(row[0].role);
                    return interaction.reply("User can only have one timed role at a time, please remove the current one first or wait for it to finish.\nRole: " + getRole.name + "\nTime Left: " + ms(timeNOW - row[0].timeLeft, { long: true }));
                }
            });
        }
        }
    }
};