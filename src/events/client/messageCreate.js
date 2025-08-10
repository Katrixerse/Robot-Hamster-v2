const { EmbedBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const ms = require('ms');
const { con } = require("../../functions/dbConnection.js");
const mainFuncs = require('../../functions/mainFuncs.js');
const modFuncs = require('../../functions/modFuncs.js');
const { addGuild } = require('../../handlers/handleTables');
const msgFuncs = require('../../functions/msgFuncs.js');
const MM = require("../../handlers/handleModmail").MM;
let prefix;

const cooldowns = {};
const usedCommandRecently = new Set();

const commandCoolDown = (message, command, bot) => {
    if (message.mentions && !message.mentions.members.last()) {
        const storeCooldown = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
        if (storeCooldown.cooldownTime >= 1) {
            con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, staffMembers) => {
                const checkRank = staffMembers != undefined ? staffMembers.length : 0;
                if (usedCommandRecently.has(`${message.author.id}(${command})`)) {
                    if (message && message.deletable) {
                        message.delete();
                    }
                    const embed = new EmbedBuilder()
                        .setColor(`#F49A32`)
                        .addFields([
                            { name: `Slow down!`, value: `You can only use this command every ${ms(cooldowns[message.author.id, command] - Date.now(), { long: true })} seconds!` }
                        ]);
                    return message.channel.send({ embeds: [embed] });
                } else {
                    const fetchGroup = bot.commands.get(command) != undefined ? bot.commands.get(command).group : bot.commands.get(bot.aliases.get(command)).group;
                    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers) && checkRank === 0 && fetchGroup != "mod") {
                        cooldowns[message.author.id, command] = Date.now() + storeCooldown.cooldownTime * 10000;
                        usedCommandRecently.add(`${message.author.id}(${command})`);
                        setTimeout(() => {
                            usedCommandRecently.delete(`${message.author.id}(${command})`);
                        }, storeCooldown.cooldownTime * 10000);
                    }
                }
            });
        }
    }
};

module.exports = async (bot, message) => {
    if (message.author.bot) return;
    if (message.channel.type === ChannelType.DM) {
        if (message.content.indexOf(" ") === 2) return;
        const mm = new MM(message, bot);
        if (!message.content.startsWith("r!") && message.content == ".start") return await mm.handleModMail();
    } else if (message.channel.type === ChannelType.GuildText) {
        if (!message.guild.members.me.permissionsIn(message.channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

        msgFuncs.modMailMsgs(message);

        con.query(`SELECT sp.prefix, ss.modOnlyCommands, ss.serverLevels, ss.ServerCash FROM serverPrefix as sp LEFT JOIN serverSettings as ss ON ss.guildId = sp.guildId WHERE sp.guildId ="${message.guild.id}"`, async (err, row) => {
            if (err) return console.log(err.stack);
            if (!row || row.length === 0)  {
                addGuild(message.guild.id);
                return;
            }

            prefix = row[0].prefix != undefined ? row[0].prefix : 'r!';

            if (!message.content.startsWith(prefix)) {
                if (message.content.includes("@here") || message.content.includes("@everyone")) return;

                mainFuncs.stickyMessages(message);

                if (row[0].ServerCash === `yes`) {
                    msgFuncs.handleCash(message);
                }
                if (row[0].serverLevels === `yes`) {
                    return msgFuncs.handleLevels(message);
                }
                return;
            }

            if (message.content.indexOf(" ") === 2) return;
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            mainFuncs.customCommands(message, command);

            let commandFile;
            try {
                if (bot.commands.has(command)) {
                    commandFile = bot.commands.get(command);
                } else if (bot.aliases.has(command)) {
                    commandFile = bot.commands.get(bot.aliases.get(command));
                }
            } catch (error) {
                console.error(`Error getting: ${command}\n\nError Info:\n${error.stack}`);
            }

            if (commandFile) {
                //bot permissions handler
                if (commandFile.group != "dev") {
                    if (commandFile.botPermissions != [] && commandFile.botPermissions != 'none') {
                        if (!message.guild.members.me.permissions.has(commandFile.botPermissions)) {
                            const permissions = new PermissionsBitField(commandFile.botPermissions).toArray();
                            return mainFuncs.send(message, `I am missing the following permission(s): ${permissions.join(", ")}`);
                        }
                    }

                    await commandCoolDown(message, command, bot);
                    if (row[0].modOnlyCommands === 'yes' && !message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;
                    if (usedCommandRecently.has(`${message.author.id}(${command})`)) return;
                    con.query(`SELECT ${commandFile.group === 'mod' ? 'moderation' : commandFile.group} FROM serverCategories WHERE guildId = "${message.guild.id}"`, async (e, getCategories) => {
                        if (!getCategories || getCategories.length === 0) return;
                        if (getCategories[0][commandFile.group === 'mod' ? 'moderation' : commandFile.group] === 'no') return;

                        try {
                            console.log(`[(Prefix command) (${message.guild.members.me.user.username}) (${message.guild.name}) (${message.author.username}) (${command}) (${args.length == 0 ? "No args detected." : args.join(' ').substring(0, 25)})]`);
                            await commandFile.run(bot, prefix, message, args, con);
                        } catch (error) {
                            console.error(`Error executing ${command}`);
                            console.error(error);
                        }
                    });
                } else {
                    console.log(`[(${message.guild.members.me.user.username}) (${message.guild.name}) (${message.author.username}) (${command}) (${args.length == 0 ? "No args detected." : args.join(' ').substring(0, 25)})]`);
                    commandFile.run(bot, prefix, message, args, con);
                }
            }
        });
    }
};