const { con } = require("../../functions/dbConnection");
const { guildWelcomeMessage, handleAutoban, handleAutoroles, handleSerCap, handlerolepersist, handleTfa } = require('./../../functions/joinFuncs');

module.exports = (bot, member) => {
    if (member.user.bot) return;
    con.query(`SELECT * FROM serverTfa WHERE guildId="${member.guild.id}"`, async (err, stfa) => {
        if (err) return console.log(`Error in event: guildMemberAdd \nDetails: ${err.stack}`);
        if (stfa.length === 0) return;
        con.query(`SELECT sar.roles, sar.enabled, ss.rolePersist, ss.serverCaptcha, wl.welcomeMessage, wl.welcomeMessageEnabled, wl.welcomeChannel, wl.style, wl.background FROM serverAutoroles as sar LEFT JOIN serverSettings as ss ON ss.guildId = sar.guildId LEFT JOIN guildWl as wl ON wl.guildId = sar.guildId WHERE sar.guildId ="${member.guild.id}"`, async (err, rows) => {
            if (err) return console.log(`Error in event: guildMemberAdd \nDetails: ${err.stack}`);
            const row = rows[0];
            if (!row || row.length === 0) return;
            con.query(`SELECT days, day, strings, string, invites, dates, date FROM serverAutoban WHERE guildId ="${member.guild.id}"`, async (err, autoBan) => {
                if (err) return console.log(`Error in event: guildMemberAdd \nDetails: ${err.stack}`);
                autoBan = autoBan[0];
                if (!autoBan || autoBan.length === 0) return;
                const banned = handleAutoban(bot, member, autoBan);
                if (banned) return;
            });
            console.log(`guildMemberAdd event fired for ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`);
            if (!member.user) return;
            if (row.welcomeMessageEnabled == "true") {
                guildWelcomeMessage(bot, row, member);
            }
            if (stfa[0].code != 'NULL' && stfa[0].code != 'none' && stfa[0].enabled === 'true') {
                return handleTfa(bot, member, stfa[0].code, row);
            }
            if (row.serverCaptcha === 'enabled') {
                return handleSerCap(bot, member, row);
            } else {
                handleAutoroles(bot, member, row);
                handlerolepersist(bot, member, row);
            }
        });
    });
};