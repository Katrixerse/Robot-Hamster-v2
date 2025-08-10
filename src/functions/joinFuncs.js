const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createCanvas, loadImage } = require('canvas');
const randomColor = require("randomcolor");
const { applyText } = require("./canvasFuncs");
const { con } = require("./dbConnection");
let attachment;
let newCode = 'none';

function ordinal_suffix_of(i) {
    const j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

async function getCode() {
    const showNum = [];
    const canvas = createCanvas(200, 40);
    const ctx = canvas.getContext('2d');
    const background = await loadImage('https://cdn.discordapp.com/attachments/463296048513810433/805523152049274930/white-noise.png');
    ctx.drawImage(background, 0, 0, 200, 40);
    const sCode = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9,!,@,#,$,%,^,&,*,(,)';
    const saCode = sCode.split(',');
    for (let i = 0; i <= 7; i++) {
        const sIndex = Math.floor(Math.random() * saCode.length);
        const sDeg = (Math.random() * 30 * Math.PI) / 180;
        const cTxt = saCode[sIndex];
        showNum[i] = cTxt;
        const x = 10 + i * 20;
        const y = 20 + Math.random() * 8;
        ctx.font = 'bold 26px Impact';
        ctx.translate(x, y);
        ctx.rotate(sDeg);

        ctx.fillStyle = randomColor();
        ctx.fillText(cTxt, 0, 0);

        ctx.rotate(-sDeg);
        ctx.translate(-x, -y);
    }
    for (let i = 0; i <= 5; i++) {
        ctx.strokeStyle = randomColor();
        ctx.beginPath();
        ctx.moveTo(
            Math.random() * 200,
            Math.random() * 40
        );
        ctx.lineTo(
            Math.random() * 200,
            Math.random() * 40
        );
        ctx.stroke();
    }
    for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = randomColor();
        ctx.beginPath();
        const x = Math.random() * 300;
        const y = Math.random() * 100;
        ctx.moveTo(x, y);
        ctx.lineTo(x + 1, y + 1);
        ctx.stroke();
    }
    newCode = showNum.join('');
    attachment = canvas.toBuffer();
}

module.exports = {
    guildWelcomeMessage: async (bot, row, member) => {
        const wMessage = row.welcomeMessage.replace(/\%NAME\%/g, member.user.username).replace(/\%PING\%/g, member).replace(/\%GUILDNAME\%/g, member.guild.name).replace(/\%MEMBERCOUNT\%/g, ordinal_suffix_of(member.guild.memberCount));
        const wChannel = member.guild.channels.cache.find(channel => channel.name == row.welcomeChannel);
        if (!wChannel) return;
        if (!member.guild.members.me.permissionsIn(wChannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        
        if (row.style === "text") {
            const embed = new EmbedBuilder()
                .setColor('#7289da')
                .addFields([
                    { name: "**User joined:**", value: `${wMessage}` }
                ]);
            bot.channels.fetch(wChannel.id).then(channel => {
                if (!channel) return;
                channel.send({ embeds: [embed] });
            }).catch(console.error);
        } else if (row.style === "image") {
            const user = member.user.displayAvatarURL({ dynamic: false }).replace("webp", "png");
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
            ctx.fillText("Welcome!", canvas.width / 1.6, 85);

            ctx.font = applyText(canvas, `${member.displayName}!`, 48);
            ctx.fillText(`${member.displayName}!`, canvas.width / 1.6, canvas.height / 1.7);

            ctx.font = '32px sans-serif';
            ctx.fillText(`${ordinal_suffix_of(member.guild.memberCount)} member`, canvas.width / 1.6, canvas.height / 1.2);

            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(convertImage, 25, 25, 200, 200);
            const attachment = canvas.toBuffer();
            if (wMessage != "none") {
                bot.channels.fetch(wChannel.id).then(channel => {
                    if (!channel) return;
                    channel.send({ content: `${wMessage}`, files: [{attachment, name: 'welBanner.png' }] });
                }).catch(console.error);
            } else {
                bot.channels.fetch(wChannel.id).then(channel => {
                    if (!channel) return;
                    channel.send({ files: [{attachment, name: 'welBanner.png'}] });
                }).catch(err => {
                    // do something with err
                });
            }
        }
    },
    handleAutoroles: (bot, member, row) => {
        const roles = row.roles.split("¶").filter(r => member.guild.roles.cache.find(role => role.name == r) !== null);
        const isEnabled = true ? row.enabled == "yes" : false;
        if (isEnabled && roles.length > 0) {
            roles.forEach(role => {
                const gRole = member.guild.roles.cache.find(r => r.name == role);
                if (!gRole) return;
                if (gRole.position < member.guild.members.me.roles.highest.position && member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    member.roles.add(gRole);
                }
            });
        }
    },
    handleAutoban: (bot, member, row) => {
        if (!member.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return;
        let banned = false;
        if (row.strings == "enabled" && !banned && row.string !== "not set") {
            if (member.user.username.toLowerCase().includes(row.string.toLowerCase())) {
                member.ban();
                banned = true;
            }
        }
        if (row.days == "enabled" && !banned && row.day !== "not set") {
            const days = parseInt(row.day);
            if (isNaN(days)) return;

            const createdAt = member.user.createdAt;
            const now = new Date();

            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= days) {
                member.ban();
                banned = true;
            }
        }
        if (row.invites == "enabled" && !banned && member.user.username.toLowerCase().includes("discord.gg")) {
            member.ban();
            banned = true;
        }
        if (row.dates == "enabled" && !banned) {
            const dNt = require("date-and-time");
            const date = dNt.parse(row.date, "D/M/YYYY");
            const createdAt = member.user.createdAt;
            console.log(date.toDateString());
            if (createdAt >= date) { // if the account was created before the date
                member.ban();
                banned = true;
            }
        }
        return banned;
    },
    handlerolepersist: (bot, member, row) => {
        if (!member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) return;
        if (row.rolePersist == "no") return;
        con.query(`SELECT * FROM serverRolepersist WHERE guildId="${member.guild.id}" AND userId="${member.id}"`, (e, rows) => {
            if (!rows || rows.length == 0) return;
            const actualRoles = rows[0].role.split("¶");
            actualRoles.forEach(role => {
                if (role == `@everyone`) return;
                const check = member.guild.roles.cache.find(r => r.name == role);
                if (!check) return;
                if (check.position >= member.guild.members.me.roles.highest.position) return;
                if (member.roles.cache.has(check.id)) return;
                member.roles.add(check.id).catch(e => console.log(`[ROLE PERSIST] Failed to add role ${role.name} to ${member.user.username}: ${e.message}`));
            });
        });
    },
    handleSerCap: async (bot, member, row) => {
        const components = (state) => [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId('refresh')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Primary)
            )
        ];

        await getCode();

        try {
            const msg = await member.send({
                files: [attachment]
            });
            const url = msg.attachments.first()?.url ?? '';
            if (msg && msg.deletable) {
                msg.delete();
            }
            const embed = new EmbedBuilder()
                .setTitle('Server Captcha')
                .setDescription(`The server: \`${member.guild.name}\` has server captcha on\nThis is to protect the server from bots\n\nPlease enter the correct code within 60 seconds or you will be kicked from the server.`)
                .setImage(url);

            const initialMessage = await member.send({
                embeds: [embed],
                components: components(false)
            });

            member.createDM().then(async c => {
                const filter = (Interaction) => Interaction.user.id === member.id;
                const collector = c.createMessageComponentCollector({
                    filter,
                    time: 120000
                });
                collector.on("collect", async (Interaction) => {
                    if (Interaction.customId === 'refresh') {
                        await getCode();
                        bot.guilds.fetch("809019379286016020").then(async g => {
                            if (!g) return;
                            const ch = g.channels.cache.get("929684337597751336");
                            const msg = await ch.send({
                                files: [attachment]
                            });
                            const url = msg.attachments.first()?.url ?? '';
                            const embed = new EmbedBuilder().setTitle('Server Captcha').setImage(url);
                            Interaction.update({
                                embeds: [embed]
                            });
                        }).catch(console.error);
                    }
                });

                collector.on("end", () => {
                    if (member != null) {
                        if (initialMessage.editable) initialMessage.edit({ components: components(true) });
                    }
                });
                const filter2 = m => m.author.id == member.id;
                c.awaitMessages({
                    filter2,
                    max: 1,
                    time: 120000
                }).then(resp => {
                    resp = resp.first();
                    if (resp.content == newCode) {
                        c.send("Correct code entered. Enjoy your stay.").catch((err) => console.log(`[Captcha] Could not dm ${member.user.username}\nReason: ${err.message}`));
                        module.exports.handleAutoroles(bot, member, row);
                        module.exports.handlerolepersist(bot, member, row);
                    } else {
                        c.send("Sorry, incorrect code entered. You have been kicked.");
                        setTimeout(() => {
                            member.kick("Did not enter the right code in Captcha").catch((err) => console.log(`[Captcha] Could not kick ${member.user.username}\nReason: ${err.message}`));
                        }, 15000);
                    }
                }).catch((err) => {
                    if (err.message === undefined) return;
                });
            }).catch((err) => {
                if (err.message === undefined) return;
                member.createDM().then(msg => {
                    msg.send({
                        content: "You ran out of time. You've been kicked."
                    });
                });
                setTimeout(() => {
                    member.kick("Did not enter the right code in Captcha").catch((err) => console.log(`[Captcha] Could not kick ${member.user.username}\nReason: ${err.message}`));
                }, 15000);
            });
        } catch (err) {
            if (err.message === undefined) return;
            member.guild.channels.fetch().catch(console.error);
            const getChannel = member.guild.channels.cache.find(c => c.name == "verification");
            if (!getChannel) return;
            if (!member.guild.members.me.permissionsIn(getChannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
            getChannel.send({
                content: `${member} due to having dms off and server captcha is enabled please verify here instead`
            });
            const msg = await getChannel.send({
                files: [attachment]
            });
            const url = msg.attachments.first()?.url ?? '';
            if (msg && msg.deletable) {
                msg.delete();
            }
            const embed = new EmbedBuilder()
                .setTitle('Server Captcha')
                .setDescription(`The server: \`${member.guild.name}\` has server captcha on\nThis is to protect the server from bots\n\nPlease enter the correct code within 60 seconds or you will be kicked from the server.`)
                .setImage(url);

            const initialMessage = await getChannel.send({
                embeds: [embed],
                components: components(false)
            });

            const filter = (Interaction) => Interaction.user.id === member.id;

            const collector = getChannel.createMessageComponentCollector({
                filter,
                time: 120000
            });

            collector.on("collect", async (Interaction) => {
                if (Interaction.customId === 'refresh') {
                    await getCode();
                    bot.guilds.fetch("809019379286016020").then(async g => {
                        if (!g) return;
                        const ch = g.channels.cache.get("929684337597751336");
                        const msg = await ch.send({
                            files: [attachment]
                        });
                        const url = msg.attachments.first()?.url ?? '';
                        const embed = new EmbedBuilder().setTitle('Server Captcha').setImage(url);
                        Interaction.update({
                            embeds: [embed]
                        });
                    }).catch(console.error);
                }
            });

            collector.on("end", () => {
                if (member != null) {
                    if (initialMessage.editable) initialMessage.edit({ components: components(true) });
                }
            });
            const filter2 = m => m.author.id == member.id;
            getChannel.awaitMessages({
                filter2,
                max: 1,
                time: 120000
            }).then(resp => {
                resp = resp.first();
                if (resp.content == newCode) {
                    getChannel.send("Correct code entered. Enjoy your stay.").catch((err) => console.log(`[Captcha] Could not dm ${member.user.username}\nReason: ${err.message}`));
                    module.exports.handleAutoroles(bot, member, row);
                    module.exports.handlerolepersist(bot, member, row);
                } else {
                    getChannel.send("Sorry, incorrect code entered. You will be kicked soon.");
                    setTimeout(() => {
                        member.kick("Did not enter the right code in Captcha").catch((err) => console.log(`[Captcha] Could not kick ${member.user.username}\nReason: ${err.message}`));
                    }, 15000);
                }
            }).catch((err) => {
                if (err.message === undefined) return;
                console.log(`Error in event: guildMemberAdd \nDetails: ${err.stack}`);
            });
        }
    },
    handleTfa: async (bot, member, code, row) => {
        try {
        const embed = new EmbedBuilder()
            .setTitle('Server password')
            .setDescription(`The server: \`${member.guild.name}\` has password on\nThis is to protect the server with a password incase the invite gets leaked.`);

            await member.send({ embeds: [embed] });

            member.createDM().then(async c => {
                c.send({
                    content: `Please enter the correct password within 2 mins or you will be kicked from the server. (If you don't know the password, please contact a server admin)`
                });
                const filter = m => m.author.id == member.id;
                c.awaitMessages({
                    filter,
                    max: 1,
                    time: 120000
                }).then(resp => {
                    resp = resp.first();
                    if (resp.content === code) {
                        if (row.serverCaptcha === 'enabled') {
                            c.send("Correct code entered.").catch(() => console.log(`[Captcha] Could not dm ${member.user.username}`));
                            return this.handleSerCap(bot, member, row);
                        } else {
                            c.send("Correct code entered. Enjoy your stay.").catch((err) => console.log(`[Pass] Could not dm ${member.user.username}\nReason: ${err.message}`));
                            module.exports.handleAutoroles(bot, member, row);
                            module.exports.handlerolepersist(bot, member, row);
                        }
                    } else {
                        c.send("Sorry, incorrect code entered. You have been kicked.");
                        setTimeout(() => {
                            member.kick("Did not enter the right code in").catch((err) => console.log(`[Pass] Could not kick ${member.user.username}\nReason: ${err.message}`));
                        }, 15000);
                    }
                }).catch((err) => {
                    if (err.message === undefined) return;
                    console.log(`Error in event: guildMemberAdd \nDetails: ${err.stack}`);
                });
            }).catch((err) => {
                if (err.message === undefined) return;
                member.createDM().then(msg => {
                    msg.send({
                        content: "You ran out of time. You've been kicked."
                    });
                });
                setTimeout(() => {
                    member.kick("Did not enter the right code in").catch((err) => console.log(`[Pass] Could not kick ${member.user.username}\nReason: ${err.message}`));
                }, 15000);
            });
        } catch (err) {
            if (err.message === undefined) return;
            member.guild.channels.fetch().catch(console.error);
            const getChannel = member.guild.channels.cache.find(c => c.name == "verification");
            if (!getChannel) return;
            if (!member.guild.members.me.permissionsIn(getChannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
            getChannel.send({
                content: `${member} due to having dms off and this server having password enabled please enter the code here instead.`
            });
            const filter = m => m.author.id == member.id;
            getChannel.awaitMessages({
                filter,
                max: 1,
                time: 120000
            }).then(resp => {
                resp = resp.first();
                if (resp.content === code) {
                    if (row.serverCaptcha === 'enabled') {
                        getChannel.send("Correct code entered.").catch(() => console.log(`[Pass] Could not dm ${member.user.username}`));
                        return this.handleSerCap(bot, member, row);
                    } else {
                        getChannel.send("Correct code entered. Enjoy your stay.").catch((err) => console.log(`[Pass] Could not dm ${member.user.username}\nReason: ${err.message}`));
                        module.exports.handleAutoroles(bot, member, row);
                        module.exports.handlerolepersist(bot, member, row);
                    }
                } else {
                    getChannel.send("Sorry, incorrect code entered. You will be kicked soon.");
                    setTimeout(() => {
                        member.kick("Did not enter the right code in Captcha").catch((err) => console.log(`[Captcha] Could not kick ${member.user.username}\nReason: ${err.message}`));
                    }, 15000);
                }
            }).catch((err) => {
                if (err.message === undefined) return;
                console.log(`Error in event: guildMemberAdd \nDetails: ${err.stack}`);
            });
        }
    }
};