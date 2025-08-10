const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'placeholders',
    aliases: ["ph"],
    description: 'View the placeholders for custom commands',
    usage: 'placeholders',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "mod" OR guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const rank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, rank)) return;
            const em = new EmbedBuilder()
                .setTimestamp()
                .setColor(`#F49A32`)
                .setTitle("Placeholders")
                .addFields([
                    { name: `[1] %NAME%`, value: "The user's name (No ping)", inline: true },
                    { name: `[2] %PING%`, value: "Pings the user who used the command.", inline: true },
                    { name: `[3] %GUILDNAME%`, value: "The name of the guild.", inline: true },
                    { name: `[4] %CHANNELNAME%`, value: "The channel the command was used in.", inline: true },
                    { name: `[5] ^CHANNEL^`, value: "By default, commands can be used in ANY channel. By adding this, you will restrict the command to that channel only. Adding multiple of these will make the command available in all the listed channels", inline: false },
                    { name: `[6] !ROLE!`, value: "By default, commands can be used by ANYONE. By adding this, you will restrict the command to that role only. Adding multiple of these will make the command available to all the listed roles", inline: false },
                    { name: `[7] +ROLE_NAME+`, value: "Adds a role to the user who used the command.", inline: false },
                    { name: `[8] -ROLE_NAME-`, value: "Removes a role from the user who used the command.", inline: false }
                ])
                .setDescription(`**All** placeholders are case sensitive, except the ones for roles/channels`)
                .setFooter({
                    text: `Example of output: Hey %NAME%, thanks for using this command in %CHANNELNAME%, channel of %GUILDNAME%. !New Member! ^general^`
                });
            message.channel.send({
                embeds: [em]
            });
        });
    }
};