const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: 'botnick',
    aliases: ["botnick"],
    description: 'Used to change the bots nickname',
    usage: 'botnick <string>',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageNicknames],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageNicknames, checkRank)) return;
            let nick = args.join(` `) || bot.user.username;
            nick = nick.substr(0, 25);
            message.guild.members.me.setNickname(nick).catch((e) => {
                return mainFuncs.send(message, `Error: ${e.message}`);
            });
            mainFuncs.send(message, `My nickname has been changed to ${nick}!`, 10);
        });
    }
};