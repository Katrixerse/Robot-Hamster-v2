const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const ms = require('ms');

module.exports = {
    name: "help",
    description: "Get help for a command",
    botPermissions: ['none'],
    options: [{
        name: "command",
        description: "Get help for a command!",
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
        const commandInfo = await interaction.options.getString("command");

        if (commandInfo) {
            const cmd = client.commands.get(commandInfo);
            if (!cmd) {
                return interaction.reply("Couldn't find that command!");
            } else {
                const helpEmbed = new EmbedBuilder()
                    .setTitle(`Help for **${cmd.name}**`)
                    .addFields([
                        { name: "Description", value: `${cmd.description}`, inline: false },
                        { name: "Aliases", value: `${cmd.aliases ? cmd.aliases.join(", ") : "None"}`, inline: false },
                        //{ name: "Usage", value: cmd.usage ? cmd.usage : "None", inline: false },
                        { name: "Cooldown", value: `${cmd.cooldownTime ? ms(cmd.cooldownTime) : "None"}`, inline: false },
                        { name: "Permissions", value: `${cmd.botPermissions ? cmd.botPermissions.join(", ") : "None"}`, inline: false }
                    ])
                    .setColor(`#F49A32`);
                if (interaction.isRepliable()) {
                    return interaction.reply({ embeds: [helpEmbed], ephemeral: true });
                }
            }
        }
    }
};