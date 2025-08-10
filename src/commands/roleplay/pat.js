const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'pat',
    aliases: ["pat"],
    description: 'Pat another user',
    usage: 'pat <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/2vFAxyl6cI8AAAAC/mai-headpats.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, you got patted by ${message.author.username}, uwu owo.`);
      message.channel.send({ embeds: [embed] });
    }
};