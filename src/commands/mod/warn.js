const { PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'warn',
    aliases: [],
    description: 'Warn someone',
    usage: 'warn <user> <reason>',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) =>
    {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, (e, staffMembers) =>
        {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.KickMembers, checkRank)) return;
            if (!args[0]) return mainFuncs.sendUsage(message, prefix, `warn <user> <reason>`, `user`);
            const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.user.id == args[0].toLowerCase());
            if (!member) return mainFuncs.send(message, "Couldn't find the member, please try again.");
            const checkPos = modFuncs.comparePos(member, message);
            if (checkPos) return message.channel.send("That person has a role with a higher or the same position as you or me");
            if (member.bot) return mainFuncs.send(message, "Can't warn a bot.");
            const res = args.slice(1).join(" ");
            if (!res) return mainFuncs.sendUsage(message, prefix, `warn <user> <reason>`, `reason`);
            con.query(`SELECT * FROM warnings WHERE guildId="${message.guild.id}" AND userId="${member.id}"`, (err, rows) =>
            {
                if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                if (rows)
                {
                    if (rows.length >= 20) return mainFuncs.send(message, "That member has too many warns. (20)");
                }
            });
            const date = new Date();
            con.query("INSERT INTO warnings (guildId, userId, warn_reason, warn_date, warned_by) VALUES (?, ?, ?, ?, ?)", [message.guild.id, member.id, con.escape(res), date.toDateString(), message.author.tag]);
            modFuncs.updateCn(message);
            con.query(`SELECT casen.cn, sr.warnMessage FROM casenumber as casen LEFT JOIN serverResponses as sr ON sr.guildId = casen.guildId WHERE casen.guildId="${message.guild.id}"`, (err, row) =>
            {
                if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                row = row[0];
                mainFuncs.send(message, `${row.warnMessage.replace('%USER%', member).replace('%GUILDNAME%', message.guild.name).replace('%REASON%', res.substring(0, 1023))}`);
                modFuncs.sendLog("Warning", message, member, res);
            });
        });
    }
};