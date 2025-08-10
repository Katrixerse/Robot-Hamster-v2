const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: 'managecategories',
    aliases: ["mc"],
    description: 'Enable/disable command categories',
    usage: 'managecategories',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
            con.query(`SELECT modlogs, chatlogs FROM serverSettings WHERE guildId="${message.guild.id}"`, async (err, row) => {

                const emojis = {
                    info: 'ℹ️',
                    mod: '🛡️',
                    leveling: '🏆',
                    economy: '💰',
                    fun: '😛',
                    image: '🖼️',
                    roleplay: '🎭',
                    misc: '🔧'
                };

                const validCategories = ["economy", "fun", "image", "info", "leveling", "misc", "mod", "roleplay"];

                const directories = [
                    ...new Set(validCategories.map(x => x))
                ];

                const categories = directories.map((dir) => {
                    return {
                        group: `${dir.slice(0)}`
                    };
                });

                const embed = new EmbedBuilder().setDescription("Please choose a category").setColor(`#F49A32`);

                const components = (state) => [
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId("category-menu")
                        .setPlaceholder("Select a category")
                        .setDisabled(state)
                        .addOptions(
                            categories.map((cmd) => {
                                return {
                                    label: cmd.group,
                                    value: cmd.group,
                                    description: `Commands from ${cmd.group} category`,
                                    emoji: emojis[cmd.group] || null
                                };
                            })
                        )
                    ),
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId('enable')
                        .setLabel('Enable')
                        .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                        .setCustomId('disable')
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Primary)
                    )
                ];

                const initialMessage = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const filter = (Interaction) => Interaction.user.id === message.author.id;

                const collector = message.channel.createMessageComponentCollector({
                    filter,
                    time: 60000
                });

                let currentCategory;

                collector.on("collect", (Interaction) => {
                    if (Interaction.customId === 'enable') {
                        if (!currentCategory) return mainFuncs.send(message, "**Please select a category before clicking buttons**", 10000);
                        con.query(`UPDATE serverCategories SET ${currentCategory.group == 'mod' ? 'moderation' : currentCategory.group} = "yes" WHERE guildId="${message.guild.id}"`);
                        const embed = new EmbedBuilder()
                            .setDescription(`Selected category: ${currentCategory.group}\nCurrently: enabled`);
                        Interaction.update({
                            embeds: [embed]
                        });
                    } else if (Interaction.customId === 'disable') {
                        if (!currentCategory) return mainFuncs.send(message, "**Please select a category before clicking buttons**", 10000);
                        con.query(`UPDATE serverCategories SET ${currentCategory.group == 'mod' ? 'moderation' : currentCategory.group} = "no" WHERE guildId="${message.guild.id}"`);
                        const embed = new EmbedBuilder()
                            .setDescription(`Selected category: ${currentCategory.group}\nCurrently: disabled`);
                        Interaction.update({
                            embeds: [embed]
                        });
                    } else if (Interaction.customId === 'category-menu') {
                        const [group] = Interaction.values;
                        const category = categories.find(
                            (x) => x.group.toLowerCase() === group);
                        if (group !== currentCategory?.group) currentCategory = '';
                        currentCategory = category;
                        con.query(`SELECT ${currentCategory.group == 'mod' ? 'moderation' : currentCategory.group} FROM serverCategories WHERE guildId = "${message.guild.id}"`, (e, getCategories) => {
                        if (!getCategories || getCategories.length === 0) return;
                        const embed = new EmbedBuilder()
                            .setDescription(`Selected category: ${currentCategory.group}\nCurrently: ${getCategories[0][currentCategory.group == 'mod' ? 'moderation' : currentCategory.group].toString().replace('yes', 'Enabled').replace('no', 'Disabled')}`);
                        Interaction.update({
                            embeds: [embed]
                        });
                    });
                    }
                });

                collector.on("end", () => {
                    if (initialMessage.editable) initialMessage.edit({ components: components(true) });
                });
            });
        });
    }
};
