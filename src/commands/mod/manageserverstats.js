const { EmbedBuilder, ButtonBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
const { serverStats } = require("../../functions/readyFuncs");

module.exports = {
    name: 'manageserverstats',
    aliases: ["mss"],
    description: 'Manage server stats',
    usage: 'mss',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
            con.query(`SELECT serverStats FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, row2) => {
                if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                row2 = row2[0];

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setTitle('📊 Server Stats')
                    .setDescription(`**currently: ${row2.serverStats}**`);

                const components_onoff = (state) => {
                    const ChangeChannelsButton = new ButtonBuilder()
                        .setDisabled(state)
                        .setCustomId("mss")
                        .setLabel("Turn on/off")
                        .setStyle(ButtonStyle.Primary);

                    const ChangeChannelRow = new ActionRowBuilder();
                    ChangeChannelRow.addComponents([ChangeChannelsButton]);

                    return [ChangeChannelRow];
                };

                const initialMessage = await message.channel.send({
                    embeds: [embed],
                    components: components_onoff(false)
                });

                const filter = (Interaction) => Interaction.user.id === message.author.id;

                const collector = message.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                    message: initialMessage
                });

                collector.on("collect", Interaction => {
                    if (Interaction.customId === 'mss') {
                        con.query(`SELECT serverStats FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, row) => {
                            if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
                            row = row[0];
                            if (row.serverStats === 'disabled') {
                                con.query(`UPDATE serverSettings SET serverStats="enabled" WHERE guildId = "${message.guild.id}"`);
                                const new_embed = embed.setDescription(`**currently: enabled**`);
                                serverStats(bot, message.guild);
                                Interaction.update({
                                    embeds: [new_embed]
                                });
                            } else if (row.serverStats === 'enabled') {
                                con.query(`UPDATE serverSettings SET serverStats="disabled" WHERE guildId = "${message.guild.id}"`);
                                const new_embed = embed.setDescription(`**currently: disabled**`);
                                const sscategory = message.guild.channels.cache.find(c => c.type == ChannelType.GuildCategory && c.name == "📊 Server Stats");
                                if (sscategory) {
                                    if (!message.guild.members.me.permissionsIn(sscategory).has(PermissionFlagsBits.ViewChannel)) return mainFuncs.send(message, "This command requires me to have Manage Channels permission.");
                                    if (sscategory?.children) {
                                        await sscategory.children.forEach(channel => channel.delete());
                                    }
                                    sscategory.delete();
                                }
                                Interaction.update({
                                    embeds: [new_embed]
                                });
                            }
                        });
                    }
                });

                collector.on("end", () => {
                    if (initialMessage.editable) initialMessage.edit({ components: components_onoff(true) });
                });
            });
        });
    }
};