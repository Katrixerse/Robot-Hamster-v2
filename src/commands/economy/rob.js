const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'rob',
    aliases: ["rob"],
    description: 'Rob command',
    usage: 'rob <user>',
    cooldownTime: '240',
    group: 'economy',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row2) => {
            if (!row2 || row2.length == 0 || row2[0].ServerCash == "no") return;
            if (row2[0].disableRobbing === "true") return mainFuncs.send(message, "Robbing is disabled on this server.");
            con.query(`SELECT * FROM serverCash WHERE guildId ="${message.guild.id}" AND userId ="${message.author.id}"`, async (e, row) => {
                row = row[0];
                if (!args[0]) return mainFuncs.sendUsage(message, prefix, `rob <user>`, `user`);
                const userToRob = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
                if (!userToRob) return mainFuncs.send(message, "Couldn't find the member, please try again.");
                if (userToRob.bot || userToRob.id == message.author.id) return mainFuncs.send(message, "Not a valid user to rob.");
                const dice = Math.floor(Math.random() * 100) + 1;
                con.query(`SELECT * FROM serverCash WHERE guildId ="${message.guild.id}" AND userId ="${userToRob.id}"`, (e, userRow) => {
                    userRow = userRow[0];
                    if (!userRow || userRow.userPurse == 0) return mainFuncs.send(message, "User does not have any money to rob!");
                    if (dice <= 50) {
                        const userMoney = userRow.userPurse;
                        const randomNum = Math.floor(Math.random() * 40) + 1;
                        let robbedAmount = Math.floor(randomNum / 100 * userMoney);
                        if (robbedAmount > userMoney) {
                            robbedAmount = userMoney;
                        }
                        mainFuncs.send(message, `You have robbed ${userToRob.user.username} for ${robbedAmount} ${row2[0].currencyType}!`);
                        con.query(`UPDATE serverCash SET userPurse = ${row.userPurse + robbedAmount} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`);
                        con.query(`UPDATE serverCash SET userPurse = ${userRow.userPurse - robbedAmount} WHERE guildId = ${message.guild.id} AND userId = ${userToRob.id}`);
                    } else {
                        const randomNum = Math.floor(Math.random() * 30) + 1;
                        let fine = Math.floor(randomNum / 100 * row.userPurse);
                        if (fine > row.userPurse) {
                            fine = row.userPurse;
                        }
                        mainFuncs.send(message, `You have been caught robbing ${userToRob.user.username} and got a fine of ${fine} ${row2[0].currencyType}!`);
                        con.query(`UPDATE serverCash SET userPurse = ${row.userPurse - fine} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`);
                    }
                });
            });
        });
    }
};