const mainFuncs = require("../../functions/mainFuncs");
const { sendProfile } = require("../../functions/levelingFuncs");

module.exports = {
    name: 'profile',
    aliases: ["level"],
    description: 'Profile command',
    usage: 'profile',
    cooldownTime: '1',
    group: 'leveling',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            con.query(`SELECT ss.serverLevels, ss.ServerCash, sls.xpNeeded FROM serverSettings as ss LEFT JOIN serverLevelSettings as sls ON sls.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}" LIMIT 1`, (e, row) => {
                const whoto = message.mentions.members.first() || message.member;
                if (row[0].serverLevels == "no") return mainFuncs.send(message, "Leveling system hasn't been enabled for this guild use >manageleveling to turn on.");
                con.query(`SELECT sc.userPurse, sc.userBank, sl.userLevel, sl.userXP, sl.userBadges, ps.background, ps.textColor, ps.font, ps.fontStyle, ps.bckgColor FROM serverCash as sc LEFT JOIN serverLevels as sl ON sl.guildId = sc.guildId AND sl.userId = sc.userId LEFT JOIN profileSettings as ps ON ps.guildId = sc.guildId AND ps.userId = sc.userId WHERE sc.guildId ="${message.guild.id}" AND sc.userId ="${whoto.id}"`, async (e, row2) => {
                    if (!row2 || row2.length === 0) return mainFuncs.send(message, 'Need to talk for a bit to build up a profile');
                    con.query(`SELECT * FROM serverLevels WHERE guildId = "${message.guild.id}" ORDER BY userLevel DESC, userXP DESC`, async (e, lb) => { // get leaderboard positions
                        sendProfile(message, whoto, row2[0], lb, row[0]);
                    });
                });
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};