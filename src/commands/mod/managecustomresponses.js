const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'managecustomresponses',
    aliases: ["mcr"],
    description: 'Manage moderation commands\' reponse when successful',
    usage: 'managecustomresponses',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            con.query(`SELECT * FROM serverResponses WHERE guildId='${message.guild.id}'`, async (e, rows) => {

                let currentCategory;

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Please pick a mod command response message to change it**\n\n**Current category:** __${!currentCategory ? "not set" : currentCategory.l}__`)
                    .addFields([
                        { name: '**Placeholders:**', value: `**%USER%** - replaced with @user (pings the user)\n**%GUILDNAME%** - replaced with the guild's name\n**%REASON%** - replaced with the reason why the action was taken` }
                    ]);

                const categories = [{ s: "banMessage", l: "Ban message" }, { s: "unbanMessage", l: "Unban message" }, { s: "kickMessage", l: "Kick message" }, { s: "warnMessage", l: "Warn message" }, { s: "muteMessage", l: "Mute message" }, { s: "unmuteMessage", l: "Unmute message" }];

                try {
                    const opts = categories.map(x => {
                        return {
                            value: x.s,
                            label: x.l
                        };
                    });

                    const IH = require("../../handlers/interactions").IH;

                    const ih = new IH(message);

                    const components = (state) => {

                        ih.create_row();

                        ih.makeNewSelectInteraction("select", "Select an option..", state, opts);

                        const row1 = ih.return_row();
                        ih.create_row();

                        ih.makeNewButtonInteraction("Change", ButtonStyle.Primary, state, "change");

                        const row2 = ih.return_row();

                        return [row1, row2];
                    };

                    const initialMessage = await message.channel.send({
                        embeds: [embed],
                        components: components(false)
                    });

                    const on_collect = (Interaction, collector) => {
                        if (Interaction.customId == "select") {
                            currentCategory = categories.find(c => c.s == Interaction.values[0]);
                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**Please pick a mod command response message to change it**\n\n**Current category:** __${!currentCategory ? "not set" : currentCategory.l}__`)
                                .addFields([
                                    { name: '**Placeholders:**', value: `**%USER%** - replaced with @user (pings the user)\n**%GUILDNAME%** - replaced with the guild's name\n**%REASON%** - replaced with the reason why the action was taken` }
                                ]);
                            Interaction.update({
                                embeds: [embed]
                            });
                        }
                        if (Interaction.customId == "change") {
                            const embed = new EmbedBuilder()
                                .setColor(0x0000ff)
                                .setDescription(`**Waiting for you to enter message..**`)
                                .addFields([
                                    { name: '**Placeholders:**', value: `**%USER%** - replaced with @user (pings the user)\n**%GUILDNAME%** - replaced with the guild's name\n**%REASON%** - replaced with the reason why the action was taken` }
                                ]);

                            if (!currentCategory) return mainFuncs.send(message, "Please pick a response first before trying to change one.");
                            
                            Interaction.update({
                                embeds: [embed]
                            });

                            const filter = m => m.author.id === message.author.id;

                            message.channel.awaitMessages({
                                filter,
                                time: 60000,
                                max: 1
                            }).then(resp => {
                                resp = resp.first().content;

                                if (!rows || rows.length == 0) {
                                    con.query("INSERT INTO serverResponses (guildId, banMessage, unbanMessage, kickMessage, warnMessage, muteMessage, unmuteMessage) VALUES (?, ?, ?, ?, ?, ?, ?)", [message.guild.id, "%USER% has been banned.", "%USER% has been unbanned.", "%USER% has been kicked.", "%USER% has been warned.", "%USER% has been muted.", "%USER% has been unmuted."]);
                                }
                                if (resp.length >= 124) return mainFuncs.send(message, "Response can't be longer than 123 characters.");
                                con.query(`UPDATE serverResponses SET ${currentCategory.s}=${con.escape(resp)} WHERE guildId="${message.guild.id}"`);
                                if (message && message.deletable) {
                                    message.delete();
                                }

                                embed.fields = [];

                                if (initialMessage.editable) initialMessage.edit({ embeds: [embed.setDescription(`**Updated ${currentCategory.l.toLowerCase()} reponse to ${resp}**`)], components: [] });

                                currentCategory = undefined;
                            }).catch(() => {
                                const embed1 = new EmbedBuilder()
                                    .setColor(0x0000ff)
                                    .setDescription(`**You ran out of time.**`);
                                if (initialMessage.editable) initialMessage.edit({ embeds: [embed1] });
                            });
                        }
                    };

                    const on_end = reason => {
                        if (reason == 'artificial') return;
                        if (initialMessage.editable) initialMessage.edit({ components: components(true) });
                    };

                    ih.create_collector(on_collect, on_end, initialMessage);
                } catch (err) {
                    if (err.message === 'Unknown interaction') return;
                    console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                }
            });
        });
    }
};