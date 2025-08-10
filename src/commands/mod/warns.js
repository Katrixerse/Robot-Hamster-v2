const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'warns',
    aliases: [],
    description: 'Check someone\'s warnings',
    usage: 'warns <user>',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, (e, staffMembers) => {
                const checkRank = staffMembers != undefined ? staffMembers.length : 0;
                if (!modFuncs.checkPerms(message, PermissionFlagsBits.KickMembers, checkRank)) return;
                if (!args[0]) return mainFuncs.sendUsage(message, prefix, `warns <user>`, `user`);
                const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.user.username.toLowerCase() == args[0].toLowerCase()) || message.guild.members.cache.find(m => m.user.id == args[0].toLowerCase()) || message.guild.members.cache.find(m => m.displayName.toLowerCase() == args[0].toLowerCase());
                if (!member) return mainFuncs.send(message, "Couldn't find the member, please try again.");
                const checkPos = modFuncs.comparePos(member, message);
                if (checkPos) return message.channel.send("That person has a role with a higher or the same position as you or me");
                con.query(`SELECT * FROM warnings WHERE guildId="${message.guild.id}" AND userId="${member.id}"`, (err, rows) => {
                    if (e) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                    if (!rows || rows.length == 0) return mainFuncs.send(message, "User has no warnings");
                    let text_to_send = ["\`\`\`\n"];
                    rows.forEach((row, i) => {
                        const index = i + 1;
                        text_to_send.push(`Warning ${index}.\nReason: ${row.warn_reason}\nDate: ${row.warn_date}\nWarned by: ${row.warned_by}\n`);
                    });
                    text_to_send.push("\`\`\`");
                    text_to_send = text_to_send.join("\n");
                    const embed = new EmbedBuilder()
                        .setTitle(`Warnings for ${member.user.username}`)
                        .setDescription(text_to_send)
                        .setColor(`#F49A32`);
                    message.channel.send({ embeds: [embed] });
                });
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};