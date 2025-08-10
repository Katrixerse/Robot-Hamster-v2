const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'smile',
    aliases: ["smile"],
    description: 'When your happy',
    usage: 'smile',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
          .setImage("https://c.tenor.com/mTbqykLo0_oAAAAC/kawai-smile.gif")
          .setTitle(`${message.author.username} feels happy!`)
          .setColor(`#F49A32`)
        message.channel.send({ embeds: [embed] });
    }
};