const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'help',
    aliases: ["help"],
    description: 'Sends a command list',
    usage: 'help',
    cooldownTime: '1',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const MAX_CMDS = 8;

            const emojis = {
                info: 'ℹ️',
                mod: '🛡️',
                leveling: '🏆',
                economy: '💰',
                fun: '😛',
                image: '🖼️',
                misc: '🔧',
                roleplay: '🎭'
            };

            const validCategories = ["image", "economy", "fun", "info", "leveling", "mod", "misc", "roleplay"];

            const directories = [
                ...new Set(validCategories.map(x => x))
            ];

            const categories = directories.map((dir) => {
                const getCommands = bot.commands
                    .filter((cmd) => cmd.group === dir)
                    .map((cmd) => {
                        return {
                            name: cmd.name || "Failed to fetch name",
                            description: cmd.description || "Failed to fetch description",
                            aliases: cmd.aliases || "Failed to fetch aliases",
                            usage: cmd.usage || "Failed to fetch usage"
                        };
                    });
                return {
                    group: `${dir.slice(0)}`,
                    commands: getCommands
                };
            });

            const embed = new EmbedBuilder().setDescription("Please choose a category").setColor(`#F49A32`);

            const components = (state) => [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId("help-menu")
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
                    .setCustomId('back')
                    .setLabel('Back')
                    .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
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

            let emarray = [];
            let currentCategory;

            collector.on("collect", (Interaction) => {
                if (Interaction.customId === 'back') {
                    if (!currentCategory) return mainFuncs.send(message, "**Please select a category before clicking buttons**", 10000);
                    const cur_page = parseInt(Interaction.message.embeds[0].title.split("/")[0]);
                    let nextidx = cur_page - 1;
                    if (nextidx < 1) nextidx = MAX_CMDS;
                    if (cur_page == 1) nextidx = 1;
                    const next_em = emarray.find(e => e.data.title.startsWith(nextidx));
                    Interaction.update({
                        embeds: [next_em]
                    });
                } else if (Interaction.customId === 'next') {
                    if (!currentCategory) return mainFuncs.send(message, "**Please select a category before clicking buttons**", 10000);
                    const cur_page = parseInt(Interaction.message.embeds[0].title.split("/")[0]);
                    let nextidx = cur_page + 1;
                    const pages = Math.ceil(currentCategory.commands.length / MAX_CMDS);
                    if (nextidx > pages) nextidx = 1;
                    const next_em = emarray.find(e => e.data.title.startsWith(nextidx));
                    Interaction.update({
                        embeds: [next_em]
                    });
                } else if (Interaction.customId === 'help-menu') {
                    const [group] = Interaction.values;
                    const category = categories.find(
                        (x) => x.group.toLowerCase() === group);
                    if (group !== currentCategory?.group) emarray = [];
                    currentCategory = category;
                    console.log(currentCategory.group);
                    const pages = Math.ceil(category.commands.length / MAX_CMDS);
                    let firstEmbed = new EmbedBuilder()
                        .setColor(`#F49A32`)
                        .setTitle(`1/${pages}`)
                        .setDescription(`**${currentCategory.group}**`)
                        .setTimestamp();

                    let page = 1;
                    currentCategory.commands.forEach((f, i) => {
                        const file = f;
                        if (!file) return;
                        const index = i + 1;

                        firstEmbed.addFields([
                            { name: `**Command:** ${f.name}`, value: `**Description:** ${file.description}\n**Aliases:** ${file.aliases.join(', ')}\n**Usage:** ${prefix}${file.usage}` }
                        ]);

                        if (index % 8 == 0) {
                            firstEmbed.setTitle(`${page}/${pages}`);
                            emarray.push(firstEmbed);
                            page = page + 1;
                            firstEmbed = new EmbedBuilder()
                                .setColor(`#F49A32`)
                                .setTimestamp()
                                .setThumbnail(bot.user.avatarURL())
                                .setTitle(`${page}/${pages}`)
                                .setDescription(`**${currentCategory.group}**`);
                        } else if (page == pages) {
                            emarray.push(firstEmbed);
                        }
                    });

                    Interaction.update({
                        embeds: [emarray[0]]
                    });
                }
            });

            collector.on("end", () => {
                if (!message.guild || !message.channel) return;
                if (initialMessage.editable) {
                    return initialMessage.edit({ components: [] });
                }
            });
        } catch (err) {
            if (err.message === `Unknown interaction`) {
                return;
            } else {
                console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            }
        }
    }
};