const { EmbedBuilder } = require("discord.js");
const request = require("node-superfetch");

const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'weather',
    aliases: ["weather"],
    description: 'Gets the weather for a location',
    usage: 'weather <location>',
    cooldownTime: '1',
    group: 'misc',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        let location = args.join(' ');
        location.replace(/ /g, ',');
        if (!location) return mainFuncs.sendUsage(mesage, prefix, 'Need to provide a city.');
        try {
            const { body } = await request
                .get('https://api.openweathermap.org/data/2.5/weather')
                .query({
                    q: location,
                    units: 'metric',
                    appid: '<API_KEY>'
                });
            const embed = new EmbedBuilder()
                .setColor("#F49A32")
                .setAuthor({ name: `${body.name}, ${body.sys.country}`, iconURL: 'https://i.imgur.com/NjMbE9o.png' })
                .setURL(`https://openweathermap.org/city/${body.id}`)
                .setTimestamp()
                .addFields([
                    { name: 'Condition', value: body.weather.map(data => `${data.main} (${data.description})`).join('\n') },
                    { name: 'Temperature', value: `${body.main.temp}°C`, inline: true },
                    { name: 'Humidity', value: `${body.main.humidity}%`, inline: true },
                    { name: 'Wind Speed', value: `${body.wind.speed} m/s`, inline: true }
                ]);
            return message.channel.send({ embeds: [embed] });
        } catch (err) {
            if (err.status === 404) return mainFuncs.send(message, `Couldn't find that location.`);
            console.log(err);
        }
    }
};