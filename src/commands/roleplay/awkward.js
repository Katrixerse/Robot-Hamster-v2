const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: 'awkward',
    aliases: ["awkward"],
    description: 'When you feel awkward',
    usage: 'awkward',
    cooldownTime: '1',
    group: 'roleplay',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const embed = new EmbedBuilder()
          .setImage("https://c.tenor.com/HOQ5bxzACaUAAAAC/dandidave-cute.gif")
          .setTitle(`${message.author.username}, is feeling awkward.`)
          .setColor(`#F49A32`)
        message.channel.send({ embeds: [embed] });
    }
};