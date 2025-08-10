const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const { PermissionFlagsBits } = require("discord.js");
module.exports = {
    name: 'clean',
    aliases: ["Clean"],
    description: 'Cleans the chat of bot messages',
    usage: 'clean',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageMessages],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const rank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, rank)) return;
            let messages = await message.channel.messages.fetch();
                messages = messages.filter(m => m.author.id == bot.user.id);
                if (messages.length == 0) return mainFuncs.send(message, "Found no messages to be cleaned.");
                message.channel.bulkDelete(messages, true).catch((e) => {
                    if (e) return mainFuncs.send(message, "Error: ${e.message}");
                });
                mainFuncs.send(message, `**:white_check_mark: Successfully cleaned ${messages.size} message(s). :white_check_mark:**`);
            });
    }
};