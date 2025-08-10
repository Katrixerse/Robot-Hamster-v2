const { EmbedBuilder, embedLength } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

const randomizer = (values, randomNr) => {
    let i, pickedValue,
            threshold = 0;

    for (i = 0; i < values.length; i++) {
        threshold += values[i].probability;
        if (threshold > randomNr) {
                pickedValue = values[i].name;
                break;
        }
    }
    return pickedValue;
};

const catchValues = [{
    name: ':gem: Gem',
    value: 1000,
    probability: 0.03
},
{
    name: ':moneybag: moneybag',
    value: 500,
    probability: 0.06
},
{
    name: ':octopus: octopus',
    value: 300,
    probability: 0.09
},
{
    name: ':tropical_fish: tropical fish',
    value: 150,
    probability: 0.1
},
{
    name : ':blowfish: blowfish',
    value: 100,
    probability: 0.2
},
{
    name: ':fish: fish',
    value: 70,
    probability: 0.3
},
{
    name: ':mans_shoe: shoe',
    value: 2,
    probability: 0.5
}];

module.exports = {
    name: 'fish',
    aliases: ["fish"],
    description: 'Go fishing',
    usage: 'fish',
    cooldownTime: '1',
    group: 'economy',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row2) => {
            if (!row2 || row2.length == 0 || row2[0].ServerCash == "no") return message.channel.send(`Economy isn't enabled in this server, can ask the server owner to enable it with mngeconmy`);
            con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row) => {
                if (!row || row.length == 0) return mainFuncs.send(message, "You have no money to manage!");
                row = row[0];

                const randomNr = Math.random();
                const getCatch = randomizer(catchValues, randomNr);
                const catchValue = catchValues.find((value) => value.name === getCatch).value;
                mainFuncs.send(message, `You've caught a ${getCatch} and got ${catchValue} ${row2[0].currencyType}!`);
                con.query(`UPDATE serverCash SET userPurse = ${row.userPurse + catchValue} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`);
            });
        });
    }
};