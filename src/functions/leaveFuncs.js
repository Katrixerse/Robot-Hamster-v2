const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { createCanvas, loadImage } = require('canvas');
const { applyText } = require("./canvasFuncs");
const { con } = require("./dbConnection");

module.exports = {
    guildLeaveMessage: (bot, member) => {
        con.query(`SELECT leaveMessage, leaveMessageEnabled, leaveChannel, style, background FROM guildWl WHERE guildId ="${member.guild.id}"`, async (e, row) => {
            if (e) console.error(e.message);
            if (!row || row.length == 0) return;
            row = row[0];

            const lMessage = row.leaveMessage.replace(/\%NAME\%/g, member.user.username).replace(/\%GUILDNAME\%/g, member.guild.name).replace(/\%MEMBERCOUNT\%/g, member.guild.memberCount);
            const lChannel = member.guild.channels.cache.find(channel => channel.name == row.leaveChannel);
            if (!lChannel) return;
            if (!member.guild.members.me.permissionsIn(lChannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

            if (row.leaveMessageEnabled == "true") {
                if (row.style === "text") {
                    const embed = new EmbedBuilder()
                        .setColor('#7289da')
                        .addFields([{
                            name: "**User left:**",
                            value: `${lMessage}`
                        }]);

                    bot.channels.fetch(lChannel.id).then(channel => {
                        if (!channel) return;
                        channel.send({
                            embeds: [embed]
                        });
                    }).catch(console.error);
                } else if (row.style === "image") {
                    const user = member.user.displayAvatarURL({
                        dynamic: false
                    }).replace("webp", "png");
                    const convertImage = await loadImage(user);
                    const data = await loadImage(`./src/assets/images/backgrounds/${row.background}.png`);
                    const canvas = createCanvas(700, 250);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(data, 0, 0, 700, 250);

                    ctx.beginPath();
                    ctx.globalAlpha = 0.5;
                    ctx.rect(15, 15, 667, 222);
                    ctx.stroke();
                    ctx.fillStyle = '#212121';
                    ctx.fill();
                    ctx.closePath();

                    ctx.textAlign = 'center';

                    ctx.globalAlpha = 1;
                    ctx.font = '52px sans-serif';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText("Goodbye!", canvas.width / 1.6, 85);

                    ctx.font = applyText(canvas, `${member.displayName}!`, 48);
                    ctx.fillText(`${member.displayName}!`, canvas.width / 1.6, canvas.height / 1.7);

                    ctx.font = '32px sans-serif';
                    ctx.fillText(`${member.guild.memberCount} members left`, canvas.width / 1.6, canvas.height / 1.2);

                    ctx.beginPath();
                    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();

                    ctx.drawImage(convertImage, 25, 25, 200, 200);
                    const attachment = canvas.toBuffer();
                    if (lMessage != "none") {
                        bot.channels.fetch(lChannel.id).then(channel => {
                            if (!channel) return;
                            channel.send({
                                content: `${lMessage}`,
                                files: [{
                                    attachment,
                                    name: 'leaveBanner.png'
                                }]
                            });
                        }).catch(console.error);
                    } else {
                        bot.channels.fetch(lChannel.id).then(channel => {
                            if (!channel) return;
                            channel.send({
                                files: [{
                                    attachment,
                                    name: 'welBanner.png'
                                }]
                            });
                        }).catch(console.error);
                    }
                }
            }
        });
    },
    rolePersist: (member) => {
        con.query(`SELECT * FROM serverSettings WHERE guildId="${member.guild.id}"`, (e, rows) => {
            if (e) return console.error(e.stack);
            if (!rows || rows.length === 0) return;
            if (rows[0].rolePersist === "no") return;
            if (member.roles.size == 0) return;
            con.query(`DELETE FROM serverRolepersist WHERE guildId="${member.guild.id}" AND userId="${member.id}"`);
            const roles = member.roles.cache.filter(r => r.position < member.guild.members.me.roles.highest.position).map(r => r.name).join("¶");
            if (roles == '@everyone') return;
            con.query(`INSERT INTO serverRolepersist (guildId, userId, role) VALUES (?, ?, ?)`, [member.guild.id, member.id, roles]);
        });
    }
};