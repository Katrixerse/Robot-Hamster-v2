const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'slap',
    aliases: ["slap"],
    description: 'Slap another user',
    usage: 'slap <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/E3OW-MYYum0AAAAC/no-angry.gif")
        .setTitle(`${message.author.username} slapped ${whotto.user.username}.`)
        .setColor(`#F49A32`)
      message.channel.send({ embeds: [embed] });
    }
};