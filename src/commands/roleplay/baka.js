const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'baka',
    aliases: ["baka"],
    description: 'When someone acts like a baka',
    usage: 'baka <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/Xcr8fHyf84gAAAAC/baka-anime.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username} is acting like a baka!`);
      message.channel.send({ embeds: [embed] });
    }
};