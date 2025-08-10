const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { sendProfile } = require("../../functions/levelingFuncs");

module.exports = {
    name: "profile",
    description: "Get a users profile",
    botPermissions: ['none'],
    options: [{
        name: "user",
        description: "The user to get the profile of",
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
        try {
            con.query(`SELECT ss.serverLevels, ss.ServerCash, sls.xpNeeded FROM serverSettings as ss LEFT JOIN serverLevelSettings as sls ON sls.guildId = ss.guildId WHERE ss.guildId ="${interaction.guild.id}" LIMIT 1`, async (e, row) => {
                if (row[0].serverLevels == "no") return interaction.reply("Leveling system hasn't been enabled for this guild use >manageleveling to turn on.");
                const whoto = await interaction.options.getMember("user");
                con.query(`SELECT sc.userPurse, sc.userBank, sl.userLevel, sl.userXP, sl.userBadges, ps.background, ps.textColor, ps.font, ps.fontStyle FROM serverCash as sc LEFT JOIN serverLevels as sl ON sl.guildId = sc.guildId AND sl.userId = sc.userId LEFT JOIN profileSettings as ps ON ps.guildId = sc.guildId AND ps.userId = sc.userId WHERE sc.guildId ="${interaction.guild.id}" AND sc.userId ="${whoto.id}"`, async (e, row2) => {
                    if (!row2 || row2.length === 0) return interaction.reply('Need to talk for a bit to build up a profile');
                    con.query(`SELECT * FROM serverLevels WHERE guildId = "${interaction.guild.id}" ORDER BY userLevel DESC, userXP DESC`, (e, lb) => { // get leaderboard positions
                        sendProfile(interaction, whoto, row2[0], lb, row[0], interaction);
                    });
                });
            });
        } catch (err) {
            console.error(err);
        }
    }
};