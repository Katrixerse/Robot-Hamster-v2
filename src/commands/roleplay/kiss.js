const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'kiss',
    aliases: ["kiss"],
    description: 'Kiss another user',
    usage: 'kiss <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/lYKyQXGYvBkAAAAC/oreshura-kiss.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, you got a kiss from ${message.author.username}.`);
      message.channel.send({ embeds: [embed] });
    }
};