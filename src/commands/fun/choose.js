const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'choose',
    aliases: ["choose"],
    description: 'Let the bot pick randomly from a few options',
    usage: 'choose zach, andrew, john',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const question = args.join(` `);
        if (question.length >= 1024) return mainFuncs.send(message, `Provided too many options.`);
        if (question) {
            const thing = question.includes(",") ? question.split(', ') : question.split(' ');
            const picked = thing[Math.floor(Math.random() * thing.length)];
            const embed = new EmbedBuilder()
                .setTimestamp()
                .setColor(`#F49A32`)
                .setDescription(`**__Picked:__** ${picked}`)
                .setThumbnail(bot.user.avatarURL());
            message.channel.send({ embeds: [embed] });
        } else {
            const filter = m => m.author.id === message.author.id;
            message.channel.send(`**__Enter the first object to choose from or type exit to cancel__**`)
                .then(() => {
                    message.channel.awaitMessages({
                            filter,
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then((obj1) => {
                            if (!obj1) return;
                            obj1 = obj1.first();
                            if (obj1.content == "exit") return mainFuncs.send(message, `Command canceled!`);
                            message.channel.send(`__**Now enter the second object.**__`)
                                .then(() => {
                                    message.channel.awaitMessages({
                                            filter,
                                            max: 1,
                                            time: 30000,
                                            errors: ['time']
                                        })
                                        .then((obj2) => {
                                            if (!obj2) return;
                                            obj2 = obj2.first();
                                            if (obj2.content == obj1.content) return mainFuncs.send(message, `Can't choose between the same thing.`);
                                            const thing = [obj1.content, obj2.content];
                                            const picked = thing[Math.floor(Math.random() * thing.length)];
                                            const embed = new EmbedBuilder()
                                                .setTimestamp()
                                                .setColor(`#F49A32`)
                                                .setDescription(`**__Picked:__** ${picked}`)
                                                .setThumbnail(bot.user.avatarURL());
                                            message.channel.send({
                                                embeds: [embed]
                                            });
                                        })
                                        .catch(err => {
                                            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                                            mainFuncs.send(message, `Time has expired.`);
                                        });
                                });
                        })
                        .catch(err => {
                            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                        });
                });
        }
    }
};