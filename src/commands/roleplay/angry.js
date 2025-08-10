const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'angry',
    aliases: ["angry"],
    description: 'When you feel angry',
    usage: 'angry <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
          .setImage("https://c.tenor.com/LZyeJ_GEGmgAAAAC/anime-anime-angry.gif")
          .setTitle(`${message.author.username} is feeling angry!`)
          .setColor(`#F49A32`)
        message.channel.send({ embeds: [embed] });
    }
};