const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
        name: '25',
        aliases: ["25"],
        description: 'Roll, if the number is above 25 you win x1.25',
        usage: '25 <number>',
        cooldownTime: '1',
        group: 'economy',
        botPermissions: ['none'],
        run: async (bot, prefix, message, args, con) => {
            try {
                con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, settings) => {
                  con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, (e, row2) => {
                    if (settings[0].ServerCash == "no") return;
                    if (!row2 || row2.length == 0 || row2[0].userPurse == 0) return mainFuncs.send(message, "You haven't earned any cash yet.");
                    const dice = Math.floor(Math.random() * 100);
                    const num = parseInt(args.join(` `));
                    const won = Math.round(num * 1.25);
                    if (!num) return mainFuncs.sendUsage(message, prefix, `25 <number>`, `number`);
                    if (isNaN(num) || num <= 0) return mainFuncs.send(message, "Not a valid number.");
                    if (!isFinite(num)) return mainFuncs.send(message, "Not a valid number.");
                    if (num > row2[0].userPurse) return mainFuncs.send(message, "Cannot bet a number higher than your balance.");
                    if (dice >= "25") {
                    const embed = new EmbedBuilder()
                        .setTitle(`You have won!`)
                        .addFields([
                            { name: "Amount:", value: `${numberWithCommas(won.toFixed(2))}` },
                            { name: "New Balance:", value: `${numberWithCommas((row2[0].userPurse + won).toFixed(2))}` }
                        ])
                        .setTimestamp()
                        .setColor(`#F49A32`);
                      message.channel.send({ embeds: [embed] });
                      con.query(`UPDATE serverCash SET userPurse = ${row2[0].userPurse + won} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                    } else {
                      const embed = new EmbedBuilder()
                        .setTitle(`You have lost!`)
                        .addFields([
                          { name: "Amount:", value: `${numberWithCommas(num.toFixed(2))}` },
                          { name: "New Balance:", value: `${numberWithCommas((row2[0].userPurse - num).toFixed(2))}` }
                        ])
                        .setTimestamp()
                        .setColor(`#F49A32`);
                      message.channel.send({ embeds: [embed] });
                      con.query(`UPDATE serverCash SET userPurse = ${row2[0].userPurse - num} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                    }
                  });
                });
              } catch (err) {
                console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
              }
        }
};