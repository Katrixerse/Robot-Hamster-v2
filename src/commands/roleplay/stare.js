const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'stare',
    aliases: ["stare"],
    description: 'Stare at another user',
    usage: 'stare <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/XQXzBqs3utEAAAAC/marin-kitagawa.gif")
        .setTitle(`${whotto.user.username}, ${message.author.username} is staring at you..`)
        .setColor(`#F49A32`)
      message.channel.send({ embeds: [embed] });
    }
};