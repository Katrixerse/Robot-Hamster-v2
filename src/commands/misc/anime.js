const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const malScraper = require('mal-scraper');

module.exports = {
  name: 'anime',
  aliases: ["anime"],
  description: 'Search for an anime',
  usage: 'anime <name>',
  cooldownTime: '1',
  group: 'misc',
  botPermissions: ['none'],
  run: async (bot, prefix, message, args, con) => {
    const search = args.join("");
    if (!search) return mainFuncs.sendUsage(message, prefix, `anime <name>`, `name`);
    try {
      malScraper.getInfoFromName(search)
        .then((data) => {
          const malEmbed = new EmbedBuilder()
            .setTitle('My Anime List')
            .setDescription(`search result for ${args.join(' ')}`)
            .setThumbnail(`${data.picture}`)
            .setColor(`#F49A32`)
            .addFields([
              { name: 'Title', value: `${data.englishTitle}` },
              { name: 'Type', value: `${data.type}` },
              { name: 'Episodes', value: `${data.episodes}` },
              { name: 'Rating', value: `${data.rating}` },
              { name: 'Aired', value: `${data.aired}` },
              { name: 'Score', value: `${data.score}` },
              { name: 'Link', value: `${data.url}` }
            ]);

          message.channel.send({ embeds: [malEmbed] });
        });
    } catch (err) {
      if (err.status === 404) return message.channel.send('Could not find any results.');
      console.log(err);
    }
  }
};