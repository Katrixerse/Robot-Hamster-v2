const { EmbedBuilder } = require("discord.js");
const imdb = require("imdb-api");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
  name: 'imdb',
  aliases: ["imdb"],
  description: 'Searches for a movie on IMDb.',
  usage: 'imdb <name>',
  cooldownTime: '1',
  group: 'misc',
  botPermissions: ['none'],
  run: async (bot, prefix, message, args, con) => {
    const name = args.join(" ");
    if (!name) return mainFuncs.sendUsage(message, prefix, `imdb <name>`, `name`);

    try {
      const imob = new imdb.Client({ apiKey: "5e36f0db" });
      const movie = await imob.get({ name: args.join(" ") });

      const embed = new EmbedBuilder()
        .setTitle(`${movie.title}`)
        .setColor(`#F49A32`)
        .setThumbnail(movie.poster)
        .addFields([
          { name: "Description", value: `${movie.plot}` },
          { name: "Release date", value: `${movie.year}` },
          { name: "Rating", value: `${movie.rating}` },
          { name: "Genre(s)", value: `${movie.genres}` },
          { name: "Actors", value: `${movie.actors}` },
          { name: "Directors", value: `${movie.director}` },
          { name: "Country", value: `${movie.country}` },
          { name: "Language", value: `${movie.languages}` },
          { name: "Awards", value: `${movie.awards}` },
          { name: "Box office", value: `${movie.boxoffice}` },
          { name: "IMDb Link", value: `https://www.imdb.com/title/${movie.imdbid}` }
        ]);
      message.channel.send({ embeds: [embed] });
    } catch (err) {
      if (err.status === 404) return message.channel.send('Could not find any results.');
      console.log(err);
    }
  }
};