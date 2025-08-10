const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'bonk',
    aliases: ["bonk"],
    description: 'Bonk another user',
    usage: 'bonk <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
      const whotto = message.mentions.members.first();
      if (!whotto) return message.channel.send(`Please mention somebody.`);
      if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
      const embed = new EmbedBuilder()
        .setImage("https://c.tenor.com/mXwNLMSQRN8AAAAC/yuru-yuri-chinatsu-yoshikawa.gif")
        .setColor(`#F49A32`)
        .setTitle(`Ouch! ${whotto.user.username}, you got bonked by ${message.author.username}.`);
      message.channel.send({ embeds: [embed] });
    }
};