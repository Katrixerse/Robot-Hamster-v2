const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'lick',
    aliases: ["lick"],
    description: 'Lick another user',
    usage: 'lick <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/uw6-q_y4xKsAAAAC/%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5-darling-in-the-franxx.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, you got licked by ${message.author.username}.`);
      message.channel.send({ embeds: [embed] });
    }
};