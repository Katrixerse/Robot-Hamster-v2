const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder, version, PermissionFlagsBits } = require("discord.js");
const ms = require('ms');

module.exports = {
    name: "prefix",
    description: "Change the prefix of the bot",
    botPermissions: ['none'],
    options: [{
        name: "prefix",
        description: "new prefix",
        type: ApplicationCommandOptionType.String,
        required: true
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args, con) => {
        const prefix = interaction.options.getString("prefix");
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            const newPrefixCheck = prefix.replace(/[^\x00-\x7F]/g, "");
            if (newPrefixCheck.length < 1 || newPrefixCheck.length > 7) return interaction.reply(`Prefix can't be shorter than 2 chars or longer than 7 chars.`);
            const cWithNameExists = client.commands.get(newPrefixCheck);
            if (cWithNameExists !== undefined) return interaction.reply("Can't set prefix to a command");
            con.query(`UPDATE serverPrefix SET prefix =${con.escape(newPrefixCheck)} WHERE guildId = ${interaction.guild.id}`);
            if (interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageNicknames)) {
                const fetchName = interaction.guild.members.me.displayName != undefined ? interaction.guild.members.me.displayName : interaction.guild.members.me.username;
                if (fetchName === 'Robot Hamster') {
                    interaction.guild.members.me.setNickname(`[${newPrefixCheck}] Robot Hamster`);
                }
            }
            interaction.reply(`Prefix has been changed to \`\`${newPrefixCheck}\`\``);
        }
    }
};