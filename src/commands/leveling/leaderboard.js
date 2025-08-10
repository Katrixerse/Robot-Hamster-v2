const mainFuncs = require("../../functions/mainFuncs");
const { createCanvas, loadImage, registerFont } = require('canvas');
const { applyText } = require("../../functions/canvasFuncs");
const { ButtonStyle, EmbedBuilder } = require("discord.js");

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    name: 'leaderboard',
    aliases: ["lb"],
    description: 'Leaderboard command',
    usage: 'leaderboard',
    cooldownTime: '6',
    group: 'leveling',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const components = (state) => {
                ih.create_row();

                ih.makeNewButtonInteraction("Levels", ButtonStyle.Primary, state, "levels");

                ih.makeNewButtonInteraction("Economy", ButtonStyle.Primary, state, "cash");

                const row = ih.return_row();

                return [row];
            };

            const status = ["**Waiting for input..**"];

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**Leaderboards**__\n\n**Which leaderboard would you like to see?**\n\n__**STATUS**__\n${status.join("\n")}`)

            const init = await message.channel.send({
                embeds: [embed],
                components: components(false)
            });

            let counter = 0;

            const on_collect = (Interaction, collector) => {
                if (Interaction.customId == "levels") {
                    if (counter >= 3) return collector.stop();
                    con.query(`SELECT serverLevels FROM serverSettings WHERE guildId ="${message.guild.id}" LIMIT 1`, (e, rowSettings) => {
                        const whoto = message.mentions.members.first() || message.member;
                        if (rowSettings[0].serverLevels == "no") return mainFuncs.send(message, "Leveling system hasn't been enabled for this guild use >manageleveling to turn on.");
                            con.query(`SELECT * FROM serverLevels WHERE guildId ="${message.guild.id}" AND userId ="${whoto.id}"`, async (e, row2) => {
                                if (!row2 || row2.length === 0) return mainFuncs.send(message, 'Need to talk for a bit to build up a profile');
                                con.query(`SELECT * FROM serverLevels WHERE guildId = "${message.guild.id}" ORDER BY userLevel DESC, userXP DESC LIMIT 13`, async (e, row) => {
                                    try {
                                        const data = await loadImage(`./src/assets/images/backgrounds/leaderboard_back.png`);
                                        const canvas = createCanvas(1200, 1500);
                                        const ctx = canvas.getContext('2d');
                                        ctx.drawImage(data, 0, 0, 1200, 1500);

                                        ctx.beginPath();
                                        ctx.globalAlpha = 0.3;
                                        ctx.rect(25, 25, 1150, 1450);
                                        ctx.stroke();
                                        ctx.fillStyle = '#D3D3D3';
                                        ctx.fill();
                                        ctx.closePath();

                                        ctx.globalAlpha = 1;
                                        //let position = 25;
                                        let userListing = '';
                                        let levelListing = '';
                                        let n = 0;
                                        row.forEach(r => {
                                            const member = message.guild.members.cache.get(r.userId);
                                            if (!member) return;
                                            if (levelListing.includes(member)) return;
                                            const checkName = member.user.username.replace(/[^\x00-\x7F]/g, "");
                                            if (checkName.length >= 3) {
                                                n++;
                                                userListing += `#${n} ${checkName.substring(0, 11)}\n`;
                                                levelListing += `Level: ${r.userLevel.toString().substring(0, 3)}\n`;
                                            }
                                        });

                                        ctx.font = '132px Impact';
                                        ctx.fillStyle = `#FFFFFF`;
                                        ctx.fillText(`Leaderboard`, 190, 150);

                                        ctx.beginPath();
                                        ctx.lineWidth = 13;
                                        ctx.moveTo(120, 200);
                                        ctx.lineTo(1070, 200);
                                        ctx.stroke();

                                        ctx.font = '76px Impact';
                                        ctx.fillStyle = `#FFFFFF`;
                                        ctx.fillText(`${userListing}`, 85, 300);

                                        ctx.font = '76px Impact';
                                        ctx.fillStyle = `#FFFFFF`;
                                        ctx.fillText(`${levelListing}`, 740, 300);

                                        const attachment = canvas.toBuffer();

                                        bot.guilds.fetch("809019379286016020").then(async getChannel => {
                                            if (!getChannel) return;
                                            const channel = getChannel.channels.cache.get("1024575575932817408");
                                            if (!channel) return console.log("Leaderboard Channel not found");
                                            const msg = await channel.send({
                                                files: [{
                                                    attachment,
                                                    name: 'leaderboard.png'
                                                }]
                                            });
                                            const getURL = msg.attachments.first().url;
                                            const getLeaderboard = new EmbedBuilder()
                                                .setTitle(`Leveling Leaderboard for ${message.guild.name}`)
                                                .setColor(0x0000ff)
                                                .setImage(getURL);

                                            Interaction.update({
                                                embeds: [getLeaderboard]
                                            });
                                        }).catch(console.error);
                                    } catch (err) {
                                        console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                                        return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
                                    }
                                });
                            });
                    });
                    counter++;
                } else if (Interaction.customId == "cash") {
                    if (counter >= 3) return collector.stop();
                    con.query(`SELECT ServerCash FROM serverSettings WHERE guildId ="${message.guild.id}" LIMIT 1`, (e, rowSettings) => {
                        const whoto = message.mentions.members.first() || message.member;
                        if (rowSettings[0].serverLevels == "no") return mainFuncs.send(message, "Leveling system hasn't been enabled for this guild use >manageleveling to turn on.");
                        con.query(`SELECT * FROM serverCash WHERE guildId ="${message.guild.id}" AND userId ="${whoto.id}"`, async (e, row1) => {
                                if (!row1 || row1.length === 0) return mainFuncs.send(message, 'Need to talk for a bit to build up a profile');
                                con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" ORDER BY userBank + userPurse DESC LIMIT 13`, async (e, row) => {
                                    try {
                                        const data = await loadImage(`./src/assets/images/backgrounds/leaderboard_back.png`);
                                        const canvas = createCanvas(1500, 1500);
                                        const ctx = canvas.getContext('2d');
                                        ctx.drawImage(data, 0, 0, 1500, 1500);

                                        ctx.beginPath();
                                        ctx.globalAlpha = 0.3;
                                        ctx.rect(25, 25, 1450, 1450);
                                        ctx.stroke();
                                        ctx.fillStyle = '#D3D3D3';
                                        ctx.fill();
                                        ctx.closePath();

                                        ctx.globalAlpha = 1;
                                        //let position = 25;
                                        let userListing = '';
                                        let levelListing = '';
                                        let n = 0;
                                        row.forEach(r => {
                                            const member = message.guild.members.cache.get(r.userId);
                                            if (!member) return;
                                            if (levelListing.includes(member)) return;
                                            n++;
                                            userListing += `#${n} ${member.user.username.substring(0, 11)}\n`;
                                            if (r.userPurse + r.userBank > 1000000) {
                                                levelListing += `Bal: $${numberWithCommas(r.userBank + r.userPurse).substring(0, 13)}\n`;
                                            } else {
                                                levelListing += `Balance: $${numberWithCommas(r.userBank + r.userPurse).substring(0, 9)}\n`;
                                            }
                                        });

                                        ctx.font = '132px Impact';
                                        ctx.fillStyle = `#FFFFFF`;
                                        ctx.fillText(`Leaderboard`, 325, 150);

                                        ctx.beginPath();
                                        ctx.lineWidth = 13;
                                        ctx.moveTo(220, 200);
                                        ctx.lineTo(1230, 200);
                                        ctx.stroke();

                                        ctx.font = '72px Impact';
                                        ctx.fillStyle = `#FFFFFF`;
                                        ctx.fillText(`${userListing}`, 85, 300);

                                        ctx.font = '72px Impact';
                                        ctx.fillStyle = `#FFFFFF`;
                                        ctx.fillText(`${levelListing}`, 730, 300);

                                        const attachment = canvas.toBuffer();

                                        bot.guilds.fetch("809019379286016020").then(async getChannel => {
                                            if (!getChannel) return;
                                            const channel = getChannel.channels.cache.get("1024575575932817408");
                                            if (!channel) return console.log("Leaderboard Channel not found");
                                            const msg = await channel.send({
                                                files: [{
                                                    attachment,
                                                    name: 'leaderboard.png'
                                                }]
                                            });
                                            const getURL = msg.attachments.first().url;
                                            const getLeaderboard = new EmbedBuilder()
                                                .setTitle(`Currency Leaderboard for ${message.guild.name}`)
                                                .setColor(0x0000ff)
                                                .setImage(getURL);

                                            Interaction.update({
                                                embeds: [getLeaderboard]
                                            });
                                        }).catch(console.error);
                                    } catch (err) {
                                        console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                                        return message.channel.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
                                    }
                                });
                        });
                    });
                    counter++;
                }

            };
            const on_end = reason => {
                if (reason == "artificial") return;
                if (init.editable) init.edit({ components: components(true) });
            };

            ih.create_collector(on_collect, on_end, init);
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};