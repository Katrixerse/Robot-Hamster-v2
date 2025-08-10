const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'bite',
    aliases: ["bite"],
    description: 'Bite another user',
    usage: 'bite <@User>',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const whotto = message.mentions.members.first();
        if (!whotto) return message.channel.send(`Please mention somebody to bite!`);
        if (whotto.id === message.author.id) return message.channel.send(`Can't mention yourself..`);
        const embed = new EmbedBuilder()
          .setImage("https://media.giphy.com/media/LO9Y9hKLupIwko9IVd/giphy.gif")
          .setTitle(`${whotto.user.username}, ${message.author.username} has bitten you!`)
          .setColor(`#F49A32`);
        message.channel.send({ embeds: [embed] });
    }
};