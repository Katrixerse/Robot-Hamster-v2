const { Client, CommandInteraction, EmbedBuilder, version } = require("discord.js");
const { botVersion } = require('../../../config.json');
const os = require("os");
const ms = require('ms');

module.exports = {
    name: "botinfo",
    description: "Shows information about the bot",
    botPermissions: ['none'],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        const embed = new EmbedBuilder()
            .setColor(`#F49A32`)
            .setTitle(`:computer: ${client.user.username}'s Info`)
            .setDescription('Robot hamster is a fully customizable multi-purpose discord bot with features like moderation, logging, welcomer and so much more.')
            .addFields([
                { name: '**__About:__**', value: `**Bot Name:** ${client.user.username}\n**Uptime:** ${ms(client.uptime, { long: true })}\n**Commands:** ${client.commands.size}\n**Bot Version:** ${botVersion}\n**Discord.js Version:** ${version}\n**Node.js Version:** ${process.version}` },
                { name: '**__System:__**', value: `**OS:** ${os.platform()}\n**CPU:** Intel(R) Xeon(R) Gold 6140\n**CPU Cores:** ${os.cpus().length}\n**Memory:** ${Math.round(os.totalmem() / 1024 / 1024)}MB\n**Uptime:** ${ms(os.uptime() * 1000, { long: true })}` },
                { name: '**__Stats:__**', value: `**Guilds:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Channels:** ${client.channels.cache.size}` },
                { name: '**__Links:__**', value: `[Invite Me](https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=277495540982&scope=bot%20applications.commands)\n[Support Server](https://discord.gg/uF7S2mCEqD)\n[Website](https://www.robothamster.ca/)\n[Vote](https://top.gg/bot/491699193585467393/vote)\n[Privacy Policy](https://robothamster.ca/privacy-policy)\n[Terms of service](https://robothamster.ca/tos)` }
            ])
            .setFooter({ text: `Made by: Katrixerse#0101 & Andrei_#1809` });
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};