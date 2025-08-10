const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'wave',
    aliases: ["wave"],
    description: 'Roleplay command',
    usage: 'wave <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
      .setImage("https://c.tenor.com/eeyZsVwZScsAAAAC/anime-wave.gif")
      .setColor(`#F49A32`)
      .setTitle(`${whotto.user.username}, ${message.author.username} waved at you!`);
      message.channel.send({ embeds: [embed] });
    }
};