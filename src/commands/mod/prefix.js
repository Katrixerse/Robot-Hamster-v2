const modFuncs = require("../../functions/modFuncs");
const mainFuncs = require("../../functions/mainFuncs");
const ms = require("ms");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = {
    name: 'prefix',
    aliases: ["prfx"],
    description: 'Change the bots prefix for the server',
    usage: 'prefix <string>',
    cooldownTime: '3',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            con.query(`SELECT prefix FROM serverPrefix WHERE guildId ="${message.guild.id}"`, (e, row) => {
                if (e) return console.error(e.stack);
                row = row[0];
                con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
                    const checkRank = staffMembers != undefined ? staffMembers.length : 0;
                    if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
                    const newPrefix = args.join(` `);
                    if (!newPrefix) return mainFuncs.sendUsage(message, prefix, `prefix <string>`, `string`);
                    const newPrefixCheck = newPrefix.replace(/[^\x00-\x7F]/g, "");
                    if (newPrefixCheck.length < 1) return mainFuncs.send(message, `Prefix can't have ASCII characters.`);
                    if (newPrefixCheck.length > 7) return mainFuncs.send(message, `Prefix can't be longer than 7 characters.`);
                    const cWithNameExists = bot.commands.get(newPrefixCheck);
                    if (cWithNameExists !== undefined) return mainFuncs.send(message, "Can't set prefix to a command");
                    if (row.prefix == newPrefixCheck) return mainFuncs.send(message, `Prefix is already set to ${newPrefixCheck}.`);
                    con.query(`UPDATE serverPrefix SET prefix =${con.escape(newPrefixCheck)} WHERE guildId = ${message.guild.id}`);
                    if (message.guild.members.me.permissionsIn(message.channel).has(PermissionFlagsBits.ManageNicknames)) {
                        const fetchName = message.guild.members.me.displayName != undefined ? message.guild.members.me.displayName : message.guild.me.username;
                        if (fetchName === 'Robot Hamster') {
                            message.guild.members.me.setNickname(`[${newPrefixCheck}] Robot Hamster`).catch((err) => { return; });
                        }
                    }
                    mainFuncs.send(message, `Prefix has been changed to \`\`${newPrefixCheck}\`\` To reset the prefix, mention me.`);
                    if (row.logsEnabled !== "true") return;
                    const embed = new EmbedBuilder()
                        .setTitle(`Prefix Changed.`)
                        .setTimestamp()
                        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) })
                        .setThumbnail(bot.user.avatarURL())
                        .setColor(`#F49A32`)
                        .addFields([
                            { name: `Old Prefix`, value: `\`\`${row.prefix}\`\``, inline: true },
                            { name: `New Prefix`, value: `\`\`${newPrefixCheck}\`\``, inline: true },
                            { name: `Changed By`, value: `<@${message.author.id}>`, inline: true }
                        ]);
                    modFuncs.sendToModChannel(message, embed);
                });
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};