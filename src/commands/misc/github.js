const { EmbedBuilder } = require("discord.js");
const request = require("node-superfetch");
const moment = require("moment");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
  name: 'github',
  aliases: ["github"],
  description: 'Get information about a GitHub repo.',
  usage: 'github <author> <repo>',
  cooldownTime: '1',
  group: 'misc',
  botPermissions: ['none'],
  run: async (bot, prefix, message, args, con) => {
    const author = args[0];
    const repository = args.slice(1).join(` `);
    try {
      const { body } = await request.get(`https://api.github.com/repos/${author}/${repository}`);
      const descriptionfix = body.description.substr(0, 300);
      const embed = new EmbedBuilder()
        .setColor(`#F49A32`)
        .setAuthor({ name: 'GitHub', iconURL: 'https://i.imgur.com/e4HunUm.png' })
        .setTitle(body.full_name)
        .setURL(body.html_url)
        .setDescription(body.description ? (descriptionfix) : 'No description.')
        .setThumbnail(body.owner.avatar_url)
        .addFields([
          { name: 'Stars', value: `${body.stargazers_count}`, inline: true },
          { name: 'Forks', value: `${body.forks}`, inline: true },
          { name: 'Open Issues', value: `${body.open_issues}`, inline: false },
          { name: 'Language', value: `${body.language ? body.language : 'Unknown'}`, inline: false },
          { name: 'Created', value: `${moment(body.created_at).format('MMMM Do YYYY')}`, inline: false },
          { name: 'Last Updated', value: `${moment(body.updated_at).format('MMMM Do YYYY')}`, inline: false }
        ]);
      message.channel.send({ embeds: [embed] });
    } catch (err) {
      if (err.status === 404) return mainFuncs.send(message, `Couldn't find that repo.`);
      console.log(err);
    }
  }
};