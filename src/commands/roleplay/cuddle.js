const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'cuddle',
    aliases: ["cuddle"],
    description: 'Cuddle another user',
    usage: 'cuddle <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/H7i6GIP-YBwAAAAC/a-whisker-away-hug.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, you got a cuddle from ${message.author.username}.`);
      message.channel.send({ embeds: [embed] });
    }
};