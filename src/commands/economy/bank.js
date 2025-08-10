const { EmbedBuilder, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    name: 'bank',
    aliases: ["bank"],
    description: 'View your bank balance',
    usage: 'bank',
    cooldownTime: '2',
    group: 'economy',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row2) => {
            if (!row2 || row2.length == 0 || row2[0].ServerCash == "no") return message.channel.send(`Economy isn't enabled in this server, can ask the server owner to enable it with mngeconmy`);
            con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row) => {
                if (!row || row.length == 0) return mainFuncs.send(message, "You have no money to manage!");
                row = row[0];

                const cashEmoji = bot.emojis.cache.find(emoji => emoji.name === "cashEmoji");
                const bankEmoji = bot.emojis.cache.find(emoji => emoji.name === "bankEmoji");

                const IH = require("../../handlers/interactions").IH;

                const ih = new IH(message);

                const embed = new EmbedBuilder()
                    .setDescription(`**Please select an option.**`)
                    .setColor(0x0000ff);

                const components = (state) => {
                    ih.create_row();

                    ih.makeNewButtonInteraction(`Deposit to bank`, ButtonStyle.Primary, state, `dep`, `📥`);

                    ih.makeNewButtonInteraction(`Withdraw from bank`, ButtonStyle.Primary, state, `with`, `📤`);

                    ih.makeNewButtonInteraction(`Send money`, ButtonStyle.Primary, state, `send`, `💸`);

                    return [ih.return_row()];
                };

                const init = await message.channel.send({
                    components: components(false),
                    embeds: [embed]
                });

                const filter = m => m.author.id === message.author.id;

                const status = [];

                const generate_desc = (money, bank) => {
                    return `__**:bank: BANK**__\n\n**Current amount of ** __${numberWithCommas(money)}__ ${row2[0].currencyType}\n**Current amount in bank: ${bankEmoji} ** __$${numberWithCommas(bank)}__\n\n__**STATUS**__\n${status.join("\n")}`;
                };

                const on_collect = (Interaction, collector) => {
                    con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row) => {
                        row = row[0];
                        if (Interaction.customId == "dep") {

                            let depped_everything = false;

                            status.push("**Waiting for you to enter amount to deposit..**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(row.userPurse, row.userBank));

                            const components = (state) => {
                                ih.create_row();

                                ih.makeNewButtonInteraction(`Deposit everything`, ButtonStyle.Primary, state, `everything_`, `✅`);

                                return [ih.return_row()];
                            };

                            Interaction.update({
                                components: components(false),
                                embeds: [embed]
                            });

                            const on_collect = (Interaction, collector) => {
                                con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row) => {
                                    row = row[0];
                                    if (Interaction.customId == "everything_") {
                                        status.push("**Deposited everything.**");

                                        depped_everything = true;

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(generate_desc(0, row.userBank + row.userPurse));

                                        await Interaction.update({
                                            embeds: [embed],
                                            components: []
                                        });

                                        con.query(`UPDATE serverCash SET userPurse=0, userBank=${row.userBank + row.userPurse} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                                    }
                                    //collector.stop("artificial");
                                });
                            };

                            const on_end = reason => {
                                if (reason == 'artificial') return;
                                if (init.editable) init.edit({ components: components(true) });
                            };

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                if (depped_everything) return;

                                resp = resp.first().content;

                                const number = parseInt(resp);

                                if (isNaN(number) || number <= 0) return mainFuncs.send(message, "That is not a valid number.");

                                if (number > row.userPurse) return mainFuncs.send(message, "That amount is higher than your current cash amount.");

                                con.query(`UPDATE serverCash SET userPurse=${row.userPurse - number}, userBank=${row.userBank + number} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);

                                status.push(`**Deposited ${numberWithCommas(number)}.**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(row.userPurse - number, row.userBank + number));

                                if (init.editable) init.edit({ components: [], embeds: [embed] });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });

                            ih.create_collector(on_collect, on_end, init);
                        } else if (Interaction.customId == "with") {

                            let withdrew_everything = false;

                            status.push("**Waiting for you to enter amount to withdraw..**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(row.userPurse, row.userBank));

                            const components = (state) => {
                                ih.create_row();

                                ih.makeNewButtonInteraction(`Withdraw everything`, ButtonStyle.Primary, state, `everything2`, `✅`);

                                return [ih.return_row()];
                            };

                            Interaction.update({
                                components: components(false),
                                embeds: [embed]
                            });

                            const on_collect = (Interaction, collector) => {
                                con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row) => {
                                    row = row[0];
                                    if (Interaction.customId == "everything2") {
                                        status.push("**Withdrew everything.**");

                                        withdrew_everything = true;

                                        const embed = new EmbedBuilder()
                                            .setColor(0x0000ff)
                                            .setDescription(generate_desc(row.userBank + row.userPurse, 0));

                                        await Interaction.update({
                                            embeds: [embed],
                                            components: []
                                        });

                                        con.query(`UPDATE serverCash SET userPurse=${row.userBank + row.userPurse}, userBank=0 WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);

                                    }
                                    //collector.stop("artificial");
                                });
                            };

                            const on_end = reason => {
                                if (reason == 'artificial') return;
                                if (init.editable) init.edit({ components: components(true) });
                            };

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                if (withdrew_everything) return;

                                resp = resp.first().content;

                                const number = parseInt(resp);

                                if (isNaN(number) || number <= 0) return mainFuncs.send(message, "That is not a valid number.");

                                if (number > row.userPurse) return mainFuncs.send(message, `That amount is higher than your current ${row.userPurse} ${row2[0].currencyType} amount.`);

                                con.query(`UPDATE serverCash SET userPurse=${row.userPurse + number}, userBank=${row.userBank - number} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);

                                status.push(`**Withdrew ${numberWithCommas(number)}.**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(row.userPurse + number, row.userBank - number));

                                if (init.editable) init.edit({ components: [], embeds: [embed] });
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (init.editable) init.edit({ embeds: [embed1] });
                            });

                            ih.create_collector(on_collect, on_end, init);
                        } else if (Interaction.customId == "send") {

                            status.push("**Waiting for you to enter amount to send.**");

                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(generate_desc(row.userPurse, row.userBank));

                            Interaction.update({
                                components: [],
                                embeds: [embed]
                            });

                            const on_end = reason => {
                                if (reason == 'artificial') return;
                                if (init.editable) init.edit({ components: components(true) });
                            };

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;
                                const number = parseInt(resp);
                                if (isNaN(number) || number <= 0) return mainFuncs.send(message, "That is not a valid number.");
                                if (number > row.userBank) return mainFuncs.send(message, "That amount is higher than your current bank amount.");
                                status.push(`**Waiting for you to mention a user.**`);

                                const embed = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(generate_desc(row.userPurse, row.userBank));

                                if (init.editable) init.edit({ components: [], embeds: [embed] });
                                message.channel.awaitMessages({
                                    filter,
                                    time: 60000,
                                    max: 1
                                }).then(resp => {
                                    const resp2 = resp.first().content;
                                    const member = resp.first().mentions.members.first() || message.guild.members.cache.get(resp2) || message.guild.members.cache.find(m => m.user.username.toLowerCase() == resp2.toLowerCase()) || message.guild.members.cache.find(m => m.displayName.toLowerCase() == resp2.toLowerCase());
                                    if (!member) return status.push("**Failed to mention a valid user.**");
                                    con.query(`UPDATE serverCash SET userBank=${row.userBank + number} WHERE guildId = "${message.guild.id}" AND userId = "${member.id}"`); // reciever
                                    con.query(`UPDATE serverCash SET userBank=${row.userBank - number} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`); // sender
                                    status.push(`**Sent ${numberWithCommas(number)} to ${member}.**`);

                                    const embed = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(generate_desc(row.userPurse, row.userBank - number));

                                    if (init.editable) init.edit({ components: [], embeds: [embed] });
                                }).catch(() => {
                                    const embed1 = new EmbedBuilder()
                                        .setColor(0x0000ff)
                                        .setDescription(`**You ran out of time.**`);
                                    if (init.editable) init.edit({ embeds: [embed1] });
                                });

                                ih.create_collector(on_collect, on_end, init);
                            });
                        }
                    });
                    collector.stop("artificial");
                };

                const on_end = reason => {
                    if (reason == 'artificial') return;
                    if (init.editable) init.edit({ components: components(true) });
                };

                ih.create_collector(on_collect, on_end, init);
            });
        });
    }
};