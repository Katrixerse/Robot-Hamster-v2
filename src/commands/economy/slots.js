const { EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'slots',
    aliases: ["slots"],
    description: 'Slots command',
    usage: 'slots',
    cooldownTime: '1',
    group: 'economy',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row) => {
                if (!row || row.length == 0 || row[0].ServerCash == "no") return;
                const slots = [':grapes:', ':cherries:', ':lemon:'];
                const slotOne = slots[Math.floor(Math.random() * slots.length)];
                const slotTwo = slots[Math.floor(Math.random() * slots.length)];
                const slotThree = slots[Math.floor(Math.random() * slots.length)];
                const slotFour = slots[Math.floor(Math.random() * slots.length)];
                const slotFive = slots[Math.floor(Math.random() * slots.length)];
                const slotSix = slots[Math.floor(Math.random() * slots.length)];
                const slotSeven = slots[Math.floor(Math.random() * slots.length)];
                const slotEight = slots[Math.floor(Math.random() * slots.length)];
                const slotNine = slots[Math.floor(Math.random() * slots.length)];
                con.query(`SELECT * FROM serverCash WHERE guildId ="${message.guild.id}" AND userId ="${message.author.id}"`, (e, row1) => {
                    row1 = row1[0];
                    const bet = parseInt(args.join(` `));
                    if (!bet) return mainFuncs.send(message, "Please enter a number to bet!");
                    if (isNaN(bet)) return mainFuncs.send(message, "Not a valid number to bet!");
                    if (!isFinite(bet)) return mainFuncs.send(message, "Not a valid number to bet!");
                    if (row1.userPurse < bet) return mainFuncs.send(message, "You don't have that much to bet! You only have ${row1.userPurse}$!");
                    if (slotOne === slotTwo && slotOne === slotThree || slotFour === slotFive && slotFour === slotSix || slotSeven === slotEight && slotSeven === slotNine) {
                        const wonamount = Math.floor(bet * 3);
                        con.query(`UPDATE serverCash SET userPurse = ${row1.userPurse + wonamount} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`);
                        const wonembed = new EmbedBuilder()
                            .setTitle(`You have Won!`)
                            .setColor(`#F49A32`)
                            .addFields([
                                { name: "Line 1", value: `${slotFour} ${slotFive} ${slotSix}` },
                                { name: "Line 2", value: `${slotOne} ${slotTwo} ${slotThree}` },
                                { name: "Line 3", value: `${slotSeven} ${slotEight} ${slotNine}` },
                                { name: "You won", value: `${wonamount} ${row[0].currencyType}` }
                            ])
                            .setTimestamp()
                            .setThumbnail(bot.user.avatarURL());
                        message.channel.send({ embeds: [wonembed] });
                    } else {
                        con.query(`UPDATE serverCash SET userPurse = ${row1.userPurse - bet} WHERE guildId = ${message.guild.id} AND userId = ${message.author.id}`);
                        const lostembed = new EmbedBuilder()
                            .setTitle(`You have Lost!`)
                            .setColor(`#F49A32`)
                            .addFields([
                                { name: "Line 1", value: `${slotFour} ${slotFive} ${slotSix}` },
                                { name: "Line 2", value: `${slotOne} ${slotTwo} ${slotThree}` },
                                { name: "Line 3", value: `${slotSeven} ${slotEight} ${slotNine}` },
                                { name: "You lost", value: `${bet} ${row[0].currencyType}` }
                            ])
                            .setTimestamp()
                            .setThumbnail(bot.user.avatarURL());
                        message.channel.send({ embeds: [lostembed] });
                    }
                });
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};