const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'fistbump',
    aliases: ["fistbump"],
    description: 'Fistbump another user',
    usage: 'fistbump <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/SJB6qh5DpCsAAAAC/free-anime.gif")
        .setColor(`#F49A32`)
        .setTitle(`${message.author.username} fist bumped ${whotto.user.username}!`);
      message.channel.send({ embeds: [embed] });
    }
};