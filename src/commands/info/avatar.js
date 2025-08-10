const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'avatar',
    aliases: ["avatar"],
    description: 'Sends a users profile picture',
    usage: 'avatar <user>',
    cooldownTime: '1',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (!args[0]) return mainFuncs.sendUsage(message, prefix, "avatar <user>", "user");
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setImage(message.member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setURL(message.member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setTitle(`Download`);
            message.channel.send({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setURL(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setTitle(`Download`);
            message.channel.send({ embeds: [embed] });
        }
    }
};