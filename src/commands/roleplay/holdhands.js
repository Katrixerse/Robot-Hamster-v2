const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'holdhands',
    aliases: ["holdhand"],
    description: 'Holdhands with another user',
    usage: 'holdhands <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/_TtNJsBXkOAAAAAC/noragami-anime.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, ${message.author.username} held your hands.`);
      message.channel.send({ embeds: [embed] });
    }
};