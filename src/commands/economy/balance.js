const { EmbedBuilder, ContextMenuInteraction } = require("discord.js");
const { createCanvas, loadImage } = require('canvas');
const mainFuncs = require("../../functions/mainFuncs");
const { applyText } = require("../../functions/canvasFuncs");

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    name: 'balance',
    aliases: ["bal"],
    description: 'View your balance',
    usage: 'balance',
    cooldownTime: '2',
    group: 'economy',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            con.query(`SELECT ss.ServerCash, ss.serverLevels, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row) => {
                const whoto = message.mentions.members.first() || message.member;
                if (row[0].serverLevels == "no") return mainFuncs.send(message, "Leveling system hasn't been enabled for this guild use >manageleveling to turn on.");
                con.query(`SELECT * FROM serverCash WHERE guildId ="${message.guild.id}" AND userId ="${whoto.id}"`, async (e, row1) => {
                    if (!row1) return mainFuncs.send(message, "You haven't earned any cash yet.");
                    con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" ORDER BY userPurse + userBank DESC `, async (e, lb) => {
                        con.query(`SELECT * FROM profileSettings WHERE guildId = "${message.guild.id}" AND userId = "${whoto.user.id}"`, async (e, pfStg) => {
                            if (!pfStg || pfStg.length === 0) return mainFuncs.send(message, 'Need to talk for a bit to build up a profile');
                            try {
                                const networth = row1.length == 0 ? '0' : `${numberWithCommas(parseInt(row1[0].userBank + row1[0].userPurse).toFixed(0))}`;
                                const user = whoto.user.avatarURL().replace('.gif', '.png').replace('.webp', '.png');
                                const convertImage = await loadImage(user);
                                const data = await loadImage(`./src/assets/images/backgrounds/${pfStg[0].background}.png`);
                                const canvas = createCanvas(700, 250);
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(data, 0, 0, 700, 250);

                                ctx.beginPath();
                                ctx.globalAlpha = 0.5;
                                ctx.rect(15, 15, 667, 222);
                                ctx.stroke();
                                ctx.fillStyle = `${pfStg[0].bckgColor}`;
                                ctx.fill();
                                ctx.closePath();

                                ctx.globalAlpha = 1;
                                ctx.font = applyText(canvas, `${whoto.user.username}!`, 52);
                                ctx.fillStyle = `${pfStg[0].textColor}`;
                                ctx.fillText(`${whoto.user.username}`, 250, 80);

                                ctx.font = '34px Impact';
                                let n = 0;
                                for (const row of lb) {
                                    n++;
                                    if (row.userId == whoto.user.id) {
                                        ctx.fillText(`#${n}`, 580, 80);
                                    }
                                }
                                ctx.font = '28px Impact';
                                ctx.fillText(`${numberWithCommas(row1[0].userPurse)} ${row[0].currencyType}`, 265, 135);
                                ctx.fillText(`Bank: ${numberWithCommas(row1[0].userBank)}`, 265, 175);
                                ctx.fillText(`Networth: ${networth}`, 265, 215);

                                ctx.beginPath();
                                ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
                                ctx.closePath();
                                ctx.clip();

                                ctx.drawImage(convertImage, 25, 25, 200, 200);

                                const attachment = canvas.toBuffer();
                                return message.channel.send({
                                    files: [{
                                        attachment,
                                        name: 'profile.png'
                                    }]
                                });
                            } catch (err) {
                                console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                                return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
                            }
                        });
                    });
                });
            });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};