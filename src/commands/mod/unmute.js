const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const { PermissionFlagsBits } = require("discord.js");
module.exports = {
    name: 'unmute',
    aliases: ["unmute"],
    description: 'Un-mute a user',
    usage: 'unmute <user>',
    cooldownTime: '3',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ModerateMembers],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ModerateMembers, checkRank)) return;
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                return mainFuncs.sendUsage(message, prefix, `unmute <user> <reason>`, `user`);
            } else {
                const checkPos = modFuncs.comparePos(member, message);
                if (checkPos) return message.channel.send("That person has a role with a higher or the same position as you or me");
                member.timeout(null).catch(console.error);
                mainFuncs.send(message, `You have un-muted ${member}`);
                modFuncs.sendLog("Un-mute", message, member, "No reason provided");
            }
        });
    }
};