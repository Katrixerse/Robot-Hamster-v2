const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'daily',
    aliases: ["daily"],
    description: 'Claim your daily reward',
    usage: 'daily',
    cooldownTime: '5',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row2) => {
            if (!row2 || row2.length == 0 || row2[0].ServerCash == "no") return message.channel.send(`Economy isn't enabled in this server, can ask the server owner to enable it with mngeconmy`);
            con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row) => {
                if (!row || row.length == 0) return mainFuncs.send(message, "You have no money to manage!");
                row = row[0];
                if (row.dailyLastClaimed >= Date.now() - 86400000) {
                    const timeLeft = (86400000 - (Date.now() - row.dailyLastClaimed)) / 1000;
                    const hours = Math.floor(timeLeft / 3600);
                    const minutes = Math.floor((timeLeft % 3600) / 60);
                    const seconds = Math.floor((timeLeft % 3600) % 60);
                    return mainFuncs.send(message, `You have to wait ${hours} hours, ${minutes} minutes, and ${seconds} seconds before you can claim your daily again!`);
                } else if (row.dailyLastClaimed >= Date.now() - 151200000) {
                    const amount = 100 * 2;
                    con.query(`UPDATE serverCash SET dailyLastClaimed = "${Date.now()}", dailyStreak = 1, userPurse = ${row.userPurse + amount} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                    const embed = new EmbedBuilder()
                        .setTitle(`You claimed your daily and got ${amount} ${row2[0].currencyType}! on a 1 day streak!`)
                        .setColor(`#F49A32`);
                    return message.channel.send({ embeds: [embed] });
                } else {
                    if (row.dailyStreak >= 7) {
                        const amount = 100 * row.dailyStreak * 2;
                        con.query(`UPDATE serverCash SET dailyLastClaimed = "${Date.now()}", dailyStreak = ${row.dailyStreak + 1}, userPurse = ${row.userPurse + amount} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                        const embed = new EmbedBuilder()
                            .setTitle(`You claimed your daily and got ${amount} ${row2[0].currencyType}! on a ${row.dailyStreak + 1} day streak!`)
                            .setColor(`#F49A32`);
                        return message.channel.send({ embeds: [embed] });
                    } else if (row.dailyStreak >= 14) {
                        const amount = 100 * row.dailyStreak * 4;
                        con.query(`UPDATE serverCash SET dailyLastClaimed = "${Date.now()}", dailyStreak = ${row.dailyStreak + 1}, userPurse = ${row.userPurse + amount} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                        const embed = new EmbedBuilder()
                        .setTitle(`You claimed your daily and got ${amount} ${row2[0].currencyType}! on a ${row.dailyStreak + 1} day streak!`)
                            .setColor(`#F49A32`);
                        return message.channel.send({ embeds: [embed] });
                    } else if (row.dailyStreak >= 30) {
                        const amount = 100 * row.dailyStreak * 6;
                        con.query(`UPDATE serverCash SET dailyLastClaimed = "${Date.now()}", dailyStreak = 0, userPurse = ${row.userPurse + amount} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                        const embed = new EmbedBuilder()
                            .setTitle(`You claimed your daily and got ${amount} ${row2[0].currencyType}! on a ${row.dailyStreak + 1} day streak!`)
                            .setColor(`#F49A32`);
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        const amount = row.dailyStreak != 0 ? row.dailyStreak * 100 : 200;
                        con.query(`UPDATE serverCash SET dailyLastClaimed = "${Date.now()}", dailyStreak = ${row.dailyStreak + 1}, userPurse = ${row.userPurse + amount} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                        const embed = new EmbedBuilder()
                            .setTitle(`You claimed your daily and got ${amount} ${row2[0].currencyType}! on a ${row.dailyStreak + 1} day streak!`)
                            .setColor(`#F49A32`);
                        return message.channel.send({ embeds: [embed] });
                    }
                }
            });
        });
    }
};