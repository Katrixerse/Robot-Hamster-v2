const { EmbedBuilder } = require('discord.js');
const request = require('node-superfetch');
module.exports = {
    name: 'today',
    aliases: ["today"],
    description: 'Gives you a random event from the past that happened today.',
    usage: 'today',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const {
                text
            } = await request
                .get('http://history.muffinlabs.com/date');
            const body = JSON.parse(text);
            const events = body.data.Events;
            const event = events[Math.floor(Math.random() * events.length)];
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setURL(body.url)
                .setTitle(`On this day (${body.date})...`)
                .setTimestamp()
                .setDescription(`${event.year}: ${event.text}`);
            return message.channel.send({
                embeds: [embed]
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};