const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'sing',
    aliases: ["sing"],
    description: 'When you feel like singing',
    usage: 'sing',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
          .setImage("https://c.tenor.com/62MkPWFD8c0AAAAC/kanon-shibuya-love-live.gif")
          .setTitle(`${message.author.username} feels like singing!`)
          .setColor(`#F49A32`)
        message.channel.send({ embeds: [embed] });
    }
};