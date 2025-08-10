const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'poke',
    aliases: ["poke"],
    description: 'Poke another user',
    usage: 'poke <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/1YMrMsCtxLQAAAAC/anime-poke.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, you got poked by ${message.author.username}.`);
      message.channel.send({ embeds: [embed] });
    }
};