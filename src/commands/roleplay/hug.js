const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'hug',
    aliases: ["hug"],
    description: 'Hug another user',
    usage: 'hug <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/1T1B8HcWalQAAAAC/anime-hug.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, you got a hug from ${message.author.username}.`);
      message.channel.send({ embeds: [embed] });
    }
};