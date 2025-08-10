const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'highfive',
    aliases: ["highfive"],
    description: 'Highfive another user',
    usage: 'highfive <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/rU9PEKyn4BsAAAAC/fairy-tail-nalu.gif")
        .setColor(`#F49A32`)
        .setTitle(`${message.author.username} high-fived ${whotto.user.username}!`);
      message.channel.send({ embeds: [embed] });
    }
};