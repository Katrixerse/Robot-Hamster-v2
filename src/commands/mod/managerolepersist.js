const { PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: 'managerolepersist',
    aliases: ["mrp"],
    description: 'Manage role persist',
    usage: 'managerolepersist',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageRoles],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
            message.channel.send("**What would you like to do?**\n\`\`\`[1] Enable role persist\n[2] Disable role persist\`\`\`");
            const filter = m => m.author.id === message.author.id;
            message.channel.awaitMessages({ filter, max: 1, errors: ["time"], time: 30000 }).then(r => {
                if (r) {
                    con.query(`SELECT rolePersist FROM serverSettings WHERE guildId="${message.guild.id}"`, (e, rows) => {
                        r = r.first().content;
                        const rpe = rows[0].rolePersist == "yes" ? true : false;
                        if (r == "1") {
                            if (rpe) return mainFuncs.send(message, "Role persist already enabled");
                            con.query(`UPDATE serverSettings SET rolePersist="yes" WHERE guildId="${message.guild.id}"`);
                            mainFuncs.send(message, "Setting enabled");
                        } else if (r == "2") {
                            if (!rpe) return mainFuncs.send(message, "Role persist is not enabled");
                            con.query(`UPDATE serverSettings SET rolePersist="no" WHERE guildId="${message.guild.id}"`);
                            mainFuncs.send(message, "Setting disabled");
                        } else {
                            mainFuncs.send(message, "Command canceled");
                        }
                    });
                }
            });
        });
    }
};