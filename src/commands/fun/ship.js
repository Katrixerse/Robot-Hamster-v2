const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'ship',
    aliases: ["ship"],
    description: 'Ship two people together',
    usage: 'ship <username> <username>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const first = args[0];
            if (!first) return mainFuncs.send(message, `You did not enter the first object to ship!`);
            const second = args[1];
            if (!second) return mainFuncs.send(message, `You did not enter the second object to ship!`);
            const percentage = Math.floor(Math.random() * 100);
            const em = new EmbedBuilder()
                .setTimestamp()
                .setTitle(`Ship`)
                .setDescription(`I ship ${first} and ${second} ${percentage}%!`)
                .setColor(`#F49A32`);
            message.channel.send({ embeds: [em] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};