const { EmbedBuilder } = require("discord.js");
const request = require('node-superfetch');
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'catfact',
    aliases: ["catfact"],
    description: 'Sends a random cat fact',
    usage: 'catfact <text>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const { body } = await request
                .get("https://catfact.ninja/fact");
            const embed = new EmbedBuilder()
                .setTitle(`Cat Fact`)
                .setDescription(`${body.fact}`)
                .setColor(`#F49A32`);
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};