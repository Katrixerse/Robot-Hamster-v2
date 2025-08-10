const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'crush',
    aliases: ["crush"],
    description: 'Crush on another user',
    usage: 'crush <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://media.giphy.com/media/bMLGNRoAy0Yko/giphy.gif")
        .setColor(`#F49A32`)
        .setTitle(`${whotto.user.username}, ${message.author.username} has a crush on you.`);
      message.channel.send({ embeds: [embed] });
    }
};