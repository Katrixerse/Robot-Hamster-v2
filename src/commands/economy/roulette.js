const { EmbedBuilder, embedLength } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

function isOdd(num) {
	if ((num % 2) == 0) return false;
	else if ((num % 2) == 1) return true;
}

module.exports = {
    name: 'roulette',
    aliases: ["roulette"],
    description: 'Play a game of roulette',
    usage: 'roulette <red/black/green> <number>',
    cooldownTime: '1',
    group: 'economy',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row2) => {
            if (!row2 || row2.length == 0 || row2[0].ServerCash == "no") return message.channel.send(`Economy isn't enabled in this server, can ask the server owner to enable it with mngeconmy`);
            con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row) => {
                if (!row || row.length == 0) return mainFuncs.send(message, "You have no money to manage!");
                row = row[0];

                let colour = args[0];
                let money = parseInt(args[1]);
                const random = Math.floor(Math.random() * 37);

                if (!colour) return mainFuncs.sendUsage(message, prefix, `roulette <g/r/b> <number>`, `color (green/red/black)`);
                colour = colour.toLowerCase();
                if (!money) return mainFuncs.sendUsage(message, prefix, `roulette <g/r/b> <number>`, `number`);
                if (money > row.userPurse) return mainFuncs.send(message, "You don't have enough money to bet that much!");

                if (colour == "b" || colour.includes("black")) {
                    colour = 0;
                } else if (colour == "r" || colour.includes("red")) {
                    colour = 1;
                } else if (colour == "g" || colour.includes("green")) {
                    colour = 2;
                } else {
                    return mainFuncs.sendUsage(message, prefix, `roulette <g/r/b> <number>`, `green/red/black`);
                }

                if (random == 0 && colour == 2) { // Green
                    money *= 15;
                    con.query(`UPDATE serverCash SET userPurse = ${row.userPurse + money} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                    const winEmbed = new EmbedBuilder()
                        .setColor("#FFFFFF")
                        .setDescription(`:red_square: You won ${money} ${row2[0].currencyType}\n\nMultiplier: 15x`);
                    message.channel.send(winEmbed);
                } else if (isOdd(random) && colour == 1) { // Red
                    money *= 1.5;
                    con.query(`UPDATE serverCash SET userPurse = ${row.userPurse + money} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                    const winEmbed = new EmbedBuilder()
                        .setColor("#FFFFFF")
                        .setDescription(`:red_square: You won ${money} ${row2[0].currencyType}\n\nMultiplier: 1.5x`);
                    message.channel.send(winEmbed);
                } else if (!isOdd(random) && colour == 0) { // Black
                    money *= 2;
                    con.query(`UPDATE serverCash SET userPurse = ${row.userPurse + money} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                    const winEmbed = new EmbedBuilder()
                        .setColor("#FFFFFF")
                        .setDescription(`:black_large_square: You won ${money} ${row2[0].currencyType}\n\nMultiplier: 2x`);
                    message.channel.send(winEmbed);
                } else { // Wrong
                    con.query(`UPDATE serverCash SET userPurse = ${row.userPurse - money} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                    const lostEmbed = new EmbedBuilder()
                        .setColor("#FFFFFF")
                        .setDescription(`You lost ${money} ${row2[0].currencyType}`);
                    message.channel.send(lostEmbed);
                }
            });
        });
    }
};