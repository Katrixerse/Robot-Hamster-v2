const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const { PermissionFlagsBits } = require("discord.js");
module.exports = {
    name: 'ban',
    aliases: ["ban"],
    description: 'Bans a user',
    usage: 'ban <user> <reason>',
    cooldownTime: '3',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.BanMembers],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const rank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.BanMembers, rank)) return;
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                return mainFuncs.sendUsage(message, prefix, `ban <user> <reason>`, `user`);
            } else {
                const checkPos = modFuncs.comparePos(member, message);
                if (checkPos) return message.channel.send("That person has a role with a higher or the same position as you or me");
                const res = args.slice(1).join(" ") || "No reason provided";
                con.query(`SELECT banMessage FROM serverResponses WHERE guildId="${message.guild.id}"`, (err, row) => {
                    if (row) {
                        row = row[0];
                        message.guild.members.ban(member, {
                            reason: res
                        }).then(user => message.channel.send(`${row.banMessage.replace('%USER%', user).replace('%GUILDNAME%', message.guild.name).replace('%REASON%', res.substring(0, 1023))}`));
                    }
                });
                modFuncs.sendLog("Ban", message, member, res);
            }
        });
    }
};