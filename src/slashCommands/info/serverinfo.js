const { Client, CommandInteraction, ApplicationCommandOptionType, ChannelType, EmbedBuilder } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: "serverinfo",
    description: "Get info about the server",
    botPermissions: ['none'],
    options: [{
        name: "serverid",
        description: "The servers ID",
        type: ApplicationCommandOptionType.String,
        required: false
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        const getGuild = interaction.options.getString("serverId");
        client.guilds.fetch(!getGuild ? interaction.guild.id : getGuild).then(async guild => {
            if (!guild || !guild.available) return mainFuncs.send(message, `Failed to fetch guild info.`, 10000);
            const getOwner = await client.users.fetch(guild.ownerId).catch(console.error);
            await guild.members.fetch({ limit: 1000 }).catch(console.error);
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle("Server Info")
                .setThumbnail(guild.iconURL())
                .setAuthor({ name: `${guild.name}` })
                .addFields([
                    { name: "**__Guild Owner:__**", value: `${getOwner?.tag}` },
                    { name: "**__Member Count:__**", value: `${guild.memberCount.toString()}` },
                    { name: "**__Cached Real Members:__**", value: `${guild.members.cache.filter(member => !member.user.bot).size === 0 ? guild.members.cache.filter(member => !member.user.bot).size : '0'}` },
                    { name: "**__Cached Bot Members:__**", value: `${guild.members.cache.filter(member => member.user.bot).size === 0 ? guild.members.cache.filter(member => member.user.bot).size : '0'}` },
                    { name: "**__Cached Channels:__**", value: `${guild.channels.cache.size === 0 ? guild.channels.cache.size : '0'}` },
                    { name: "**__Cached Text Channels:__**", value: `${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size === 0 ? guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size : '0'}` },
                    { name: "**__Cached Voice Channels:__**", value: `${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size === 0 ? guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size : '0'}` },
                    { name: "**__Created On:__**", value: `${guild.createdAt.toDateString()}` }
                ]);
            return interaction.reply({ embeds: [embed] });
        }).catch(err => {
            console.log(err);
            mainFuncs.send(message, `Invalid guild Id.`, 10000);
        });
    }
};