const { EmbedBuilder } = require("discord.js");
const request = require("node-superfetch");

const mainFuncs = require("../../functions/mainFuncs");

const types = ['top'];

module.exports = {
    name: 'urban',
    aliases: ["urban"],
    description: 'Search the urban dictionary.',
    usage: 'urban <string>',
    cooldownTime: '1',
    group: 'misc',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (!message.channel.nsfw) return mainFuncs.send(message, `Cannot send NSFW content in a SFW channel.`);
        const word = args.join(" ");
            const { body } = await request
              .get('http://api.urbandictionary.com/v0/define')
              .query({
                term: word
              });
            if (!body.list.length) return mainFuncs.send(message, 'Could not find any results.');
            const data = body.list[types === 'top' ? 0 : Math.floor(Math.random() * body.list.length)];
            const embed = new EmbedBuilder()
                .setColor("#F49A32")
                .setAuthor({ name: 'Urban Dictionary', iconURL: 'https://i.imgur.com/Fo0nRTe.png' })
                .setURL(data.permalink)
                .setTitle(data.word)
                .setDescription(data.definition.length > 2048 ? data.definition.substr(0, 2000) : data.definition)
                .addFields([
                    { name: "**__Example:__**", value: data.example.substr(0, 2000) },
                ]);
        message.channel.send({ embeds: [embed] });
    }
};