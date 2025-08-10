const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'sip',
    aliases: ["sip"],
    description: 'When you sipping a drink',
    usage: 'sip',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
          .setImage("https://c.tenor.com/RJ9qC27CvCEAAAAC/giorno-tea.gif")
          .setTitle(`${message.author.username} is sipping tea!`)
          .setColor(`#F49A32`)
        message.channel.send({ embeds: [embed] });
    }
};