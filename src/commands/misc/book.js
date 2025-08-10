const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const request = require("node-superfetch");
const { googleAPIkey } = require("../../../config.json");

module.exports = {
    name: 'book',
    aliases: ["book"],
    description: 'Get information about a book',
    usage: 'book <name>',
    cooldownTime: '1',
    group: 'misc',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const query = args.join(` `);
        if (!query) return mainFuncs.sendUsage(message, prefix, `book <name>`, `name`);
        const { body } = await request
            .get('https://www.googleapis.com/books/v1/volumes')
            .query({
                maxResults: 1,
                q: query,
                key: googleAPIkey
            });
        if (!body) return mainFuncs.send(message, `Couldn't find that book.`);
        if (!body.items) return mainFuncs.send(message, `Couldn't find that book.`);
        const book = body.items[0].volumeInfo;
        const description = book.description;
        if (!description) return mainFuncs.send(message, `Couldn't find that book.`);
        const descriptionfix = description.substr(0, 600);
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .setTitle(`${book.title}`)
            .addFields([
                { name: `Author`, value: `${book.authors[0]}` },
                { name: `Description`, value: `${descriptionfix}...` },
                { name: `Published`, value: `${book.publishedDate}` },
                { name: `Page Count`, value: `${book.pageCount}` },
                { name: `Link`, value: `${book.canonicalVolumeLink}` }
            ]);
            //.setThumbnail(book.imageLinks?.thumbnail);
        message.channel.send({ embeds: [embed] });
    }
};