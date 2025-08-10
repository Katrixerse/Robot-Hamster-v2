const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const { PermissionFlagsBits } = require("discord.js");
module.exports = {
    name: 'slowmode',
    aliases: ["slowmode"],
    description: 'Enables slowmode in a channel',
    usage: 'slowmode <seconds> ',
    cooldownTime: '3',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const rank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.BanMembers, rank)) return;
                const time = args[0];
                if (!time) return mainFuncs.sendUsage(message, prefix, `mute <time> <reason>`, `time`);
                if (isNaN(time)) return mainFuncs.send(message, "Not a valid time. (Example: 30)");
                const res = args.slice(1).join(" ") || "No reason provided";
                message.channel.setRateLimitPerUser(parseInt(time), res);
                message.channel.send("Slowmode is now enabled for this channel");
                modFuncs.sendLog("Slowmode", message, "none", res);
        });
    }
};