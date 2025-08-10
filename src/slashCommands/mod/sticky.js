const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { con } = require("../../functions/dbConnection");

module.exports = {
    name: "sticky",
    description: "Set a message to be sticky",
    botPermissions: ['none'],
    options: [{
        name: "message",
        description: "The message to sticky",
        type: ApplicationCommandOptionType.String,
        required: true
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                const embed = new EmbedBuilder()
                    .setTitle('Sticky messages guide')
                    .setDescription(`To use sticky messages type /stick <message> (Char limit: 2048)\nMarkdown: \`\`\`Bold **text**\nItalics *text*\nSpoilers || text ||\nStrike-Through ~~text~~\nCode Block \`\`text\`\` \nEmbedded Link [text](link)\`\`\``)
                    .setColor(`#F49A32`);

                const premiumEmbed = new EmbedBuilder()
                    .setTitle('Max sticky messages')
                    .setDescription(`Hey you have reached the max sticky messages for this server.`)
                    .setColor(`#F49A32`);

                if (!args[0]) return interaction.reply({ embeds: [embed] });
                if (args.join(' ').length >= 2048) return interaction.reply({ embeds: [embed] });
                con.query(`SELECT * FROM serverStickyMessages WHERE guildId = "${interaction.guild.id}" AND channelId = "${interaction.channel.id}"`, async (e, row) => {
                    if (row.length >= 5) return interaction.reply({ embeds: [premiumEmbed] });
                    row = row[0];
                    if (!row) {
                        const successEmbed = new EmbedBuilder()
                            .setDescription(`${args.join(' ')}`)
                            .setColor(`#F49A32`);

                        con.promise().query(`INSERT INTO serverStickyMessages (guildId, channelId, messageContent, isEmbeded, messagesBeforeSticky, lastStickyMessage) VALUES (?, ?, ?, ?, ?, ?)`, [interaction.guild.id, interaction.channel.id, 'none', 'yes', 5, 'none']);

                        await interaction.reply({ embeds: [successEmbed] });
                        interaction.fetchReply().then(reply => con.promise().query(`UPDATE serverStickyMessages SET messageContent = ${con.escape(args.join(' '))}, lastStickyMessage = "${reply.id}" WHERE guildId = "${interaction.guild.id}" AND channelId = "${interaction.channel.id}"`));
                    } else {
                        const successEmbed = new EmbedBuilder()
                            .setDescription(`${args.join(' ')}`)
                            .setColor(`#F49A32`);

                        await interaction.reply({ embeds: [successEmbed] });
                        interaction.fetchReply().then(reply => con.promise().query(`UPDATE serverStickyMessages SET messageContent = ${con.escape(args.join(' '))}, lastStickyMessage = "${reply.id}" WHERE guildId = "${interaction.guild.id}" AND channelId = "${interaction.channel.id}"`));
                    }
                });
        }
    }
};