const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const ms = require("ms");
const { PermissionFlagsBits } = require("discord.js");
module.exports = {
    name: 'mute',
    aliases: ["mute"],
    description: 'Mute a user',
    usage: 'mute <user> <time> <reason>',
    cooldownTime: '3',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ModerateMembers],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const rank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ModerateMembers, rank)) return;
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                return mainFuncs.sendUsage(message, prefix, `Mute <user> <reason>`, `user`);
            } else {
                const checkPos = modFuncs.comparePos(member, message);
                if (checkPos) return message.channel.send("That person has a role with a higher or the same position as you or me");
                const time = args[1];
                if (!time) return mainFuncs.sendUsage(message, prefix, `mute <user> <time> <reason>`, `time`);
                if (!time.endsWith("s") && !time.endsWith("m") && !time.endsWith("h") && !time.endsWith("d")) return mainFuncs.send(message, "Not a valid time. (Example: 30s, 1m, 2h, 1d)");
                if (ms(time) >= 2419200000) return mainFuncs.send(message, "Can't mute for more than 28 days.");
                const res = args.slice(2).join(" ") || "No reason provided";
                con.query(`SELECT muteMessage FROM serverResponses WHERE guildId="${message.guild.id}"`, (err, row) => {
                    if (row) {
                        row = row[0];
                        member.timeout(parseInt(ms(time), res)).then(user => message.channel.send(`${row.muteMessage.replace('%USER%', user).replace('%GUILDNAME%', message.guild.name).replace('%REASON%', res.substring(0, 1023))}`)).catch(console.error);
                    }
                });
                modFuncs.sendLog("Mute", message, member, res);
            }
        });
    }
};