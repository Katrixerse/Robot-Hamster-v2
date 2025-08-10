const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
let giveawayRolesCheck;
const tempUsers = new Set();
module.exports = {
    name: 'reroll',
    aliases: ["rr"],
    description: 'Reroll a giveaway, using the message id of the embed. (must be done in the same channel)',
    usage: 'reroll <messageid>',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ReadMessageHistory],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
            const mid = args[0];
            if (!mid) return mainFuncs.sendUsage(message, prefix, `reroll <messageid>`, `messageid`);
            try {
                message.channel.messages.fetch(mid).then(async mes => {
                    if (!mes) return mainFuncs.send(message, "Could not find a message with that id in this channel");
                    if (mes.embeds.length == 0 || mes.embeds?.description.length == 0) return mainFuncs.send(message, "That message does not contain an giveaway embed. Make sure you get the id of the message with the giveaway embed.");
                    const embed = mes.embeds[0];
                    if (embed.title.includes("Started!")) return mainFuncs.send(message, "That giveaway hasn't ended yet");
                    if (embed.description.includes("Nobody won")) return mainFuncs.send(message, "Nobody won that giveaway. Cannot reroll");
                    const currentWinner = embed.description.split("@")[1].split(">")[0];
                    let winners = parseInt(embed.footer.text.split(" ")[0]);
                    const reaction = mes.reactions.cache.get("🎉");
                    const reactionUsers = await reaction.users.fetch();
                    if (!reactionUsers) return;
                    if (winners > reactionUsers.size) winners = reactionUsers.size;
                    const authid = embed.fields[0].value.split("@")[1].split(">")[0];

                    // REMOVE BOTS & AUTHOR
                    reactionUsers.delete(authid);
                    reactionUsers.delete(currentWinner);
                    reactionUsers.forEach(u => {
                        if (u.bot) reactionUsers.delete(u.id);
                    });

                    if (embed.fields[1].value != null && embed.fields[1].value != "none") {
                        if (embed.fields[1].value.includes(`, `)) {
                            reactionUsers.forEach(u => {
                                const guildMember = message.guild.members.cache.get(u.id);
                                const roleArr = embed.fields[1].value.split(`, `);
                                roleArr.forEach(gRole => {
                                    if (gRole === "" || gRole === " ") return;
                                    const fixGRole = gRole.replace(`<`, ``).replace(`@`, ``).replace(`&`, ``).replace(`>`, ``);
                                    const giveawayRole = message.guild.roles.cache.find(role => role.id === fixGRole);
                                    if (!giveawayRole) {
                                        return giveawayRolesCheck = `invalidRole`;
                                    } else {
                                        if (guildMember.roles.cache.has(giveawayRole.id) && tempUsers.has(u.id) == false) {
                                            return tempUsers.add(u.id);
                                        } else if (guildMember.roles.cache.has(giveawayRole.id) == false && tempUsers.has(u.id) == false) {
                                            return reactionUsers.delete(u.id);
                                        } else {
                                            return;
                                        }
                                    }
                                });
                            });
                            if (giveawayRolesCheck === `invalidRole`) {
                                return;
                            }
                        } else {
                            const fixGRole = embed.fields[1].value.replace(`<`, ``).replace(`@`, ``).replace(`&`, ``).replace(`>`, ``);
                            const requiredRole = message.guild.roles.cache.find(role => role.id === fixGRole);
                            if (!requiredRole) {
                                return;
                            }

                            reactionUsers.forEach(u => {
                                const guildMember = message.guild.members.cache.get(u.id);
                                if (!guildMember.roles.cache.has(requiredRole.id)) return reactionUsers.delete(u.id);
                            });
                        }
                    }
                    tempUsers.clear();
                    giveawayRolesCheck = '';

                    if (reactionUsers.size == 0) {
                        return mainFuncs.send(message, "There are no users left to pick a new winner.");
                    }

                    const winnersarr = [];
                    const getRand = () => {
                        for (let i = 0; i < winners; i += 1) {
                            let winner = reactionUsers.random();
                            while (winnersarr.includes(winner)) {
                                winner = reactionUsers.random();
                            }
                            winnersarr.push(winner);
                        }
                        return winnersarr;
                    };
                    getRand();
                    const fixEmbed = embed.description.split(/,(.+)/)[1];
                    const editWinner = new EmbedBuilder();
                    editWinner.setColor(`#F49A32`);
                    editWinner.setThumbnail(bot.user.avatarURL());
                    editWinner.setAuthor({ name: embed.author.name });
                    editWinner.setTitle("Giveaway Ended");
                    editWinner.setDescription(`Congratulations ${winnersarr.map(r => r)},` + fixEmbed);
                    editWinner.addFields([
                        { name: "Hosted By", value: `${embed.fields[0].value}` },
                        { name: "Role(s) Required", value: `${embed.fields[1].value}` }
                    ]);
                    editWinner.setFooter({ text: embed.footer.text });
                    editWinner.setTimestamp();
                    if (mes.editable) mes.edit({ embeds: [editWinner] });
                    message.channel.send("**New winner(s):** " + winnersarr.map(r => r));
                }).catch((err) => {
                    console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                    mainFuncs.send(message, "Not a valid message id");
                });
            } catch (err) {
                console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            }
        });
    }
};