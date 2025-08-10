const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'sleep',
    aliases: ["sleep"],
    description: 'When you need a nap',
    usage: 'sleep',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
          .setImage("https://c.tenor.com/qlxdd9DVMHUAAAAC/willcore-kon.gif")
          .setTitle(`${message.author.username} needs a nap!`)
          .setColor(`#F49A32`)
        message.channel.send({ embeds: [embed] });
    }
};