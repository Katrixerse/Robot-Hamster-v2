const { EmbedBuilder } = require("discord.js");
const moment = require("moment");
const request = require("node-superfetch");

const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'npm',
    aliases: ["npm"],
    description: 'Get information about a npm package.',
    usage: 'npm <package>',
    cooldownTime: '1',
    group: 'misc',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
        const pkg = args.join(` `);
        if (!pkg) return mainFuncs.sendUsage(message, prefix, 'Need to provide a package name.', 'name');
        const { body } = await request
            .get(`https://registry.npmjs.com/${pkg}`);
            if (!body) return mainFuncs.send(message, "This package doesn't exist.");
            if (body.time.unpublished) return mainFuncs.send(message, 'This package no longer exists.');
            const version = body.versions[body['dist-tags'].latest];
            const maintainers = body.maintainers.map(user => user.name);
            const dependencies = version.dependencies ? Object.keys(version.dependencies) : null;
            const embed = new EmbedBuilder()
              .setColor(`#F49A32`)
              .setAuthor({ name: 'NPM', URL: 'https://www.npmjs.com/' })
              .setTitle(body.name)
              .setURL(`https://www.npmjs.com/package/${pkg}`)
              .setDescription(body.description || 'No description.')
              .addFields([
                { name: "Version", value: `${body['dist-tags'].latest}`, inline: true },
                { name: "License", value: `${body.license || "None"}`, inline: true },
                { name: "Author", value: `${body.author ? body.author.name : "???"}`, inline: true },
                { name: "Creation Date", value: `${moment.utc(body.time.created).format("MM/DD/YYYY h:mm A")}`, inline: true },
                { name: "Modification Date", value: `${moment.utc(body.time.modified).format("MM/DD/YYYY h:mm A")}`, inline: true },
                { name: "Main File", value: `${version.main || "index.js"}`, inline: true },
                { name: "Dependencies", value: `${dependencies && dependencies.length ? dependencies.join(", ") : "None"}` },
                { name: "Maintainers", value: `${maintainers.join(", ")}` }
              ]);
          message.channel.send({ embeds: [embed] });
        } catch (err) {
            if (err.status === 404) return message.channel.send('Could not find any results.');
            console.log(err);
        }
    }
};