const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const ms = require('ms');

module.exports = {
    name: "ping",
    description: "Pong",
    botPermissions: ['none'],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        const start = Date.now();

        const embed = new EmbedBuilder()
            .setDescription("Pinging...")
            .setColor(`#F49A32`);

        await interaction.reply({
            embeds: [embed]
          });

            const embed2 = new EmbedBuilder()
              .setColor(`#F49A32`)
              .setTitle(`:ping_pong: Pong`)
              .addFields([
                { name: "API:", value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: "Bot:", value: `${Date.now() - start}ms`, inline: true },
                { name: "Uptime:", value: `${ms(client.uptime, { long: true })}`, inline: true }
              ]);
            interaction.editReply({ embeds: [embed2] }).catch((e) => interaction.followUp(e));
    }
};