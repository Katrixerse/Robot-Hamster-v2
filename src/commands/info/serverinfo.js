const { EmbedBuilder, ChannelType } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'serverinfo',
    aliases: ["svrinf"],
    description: 'Gets info about the server',
    usage: 'serverinfo',
    cooldownTime: '1',
    group: 'info',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        bot.guilds.fetch(!args[0] ? message.guild.id : args[0]).then(async guild => {
            if (!guild || !guild.available) return mainFuncs.send(message, `Failed to fetch guild info.`);
            const getOwner = await bot.users.fetch(guild.ownerId);
            await guild.members.fetch({ limit: 1000 });
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle("Server Info")
                .setThumbnail(guild.iconURL())
                .setAuthor({ name: `${guild.name}` })
                .addFields([
                    { name: "**__Guild Owner:__**", value: `${getOwner?.tag}`},
                    { name: "**__Member Count:__**", value: `${guild.memberCount.toString()}` },
                    { name: "**__Cached Real Members:__**", value: `${guild.members.cache.filter(member => !member.user.bot).size === 0 ? guild.members.cache.filter(member => !member.user.bot).size : '0'}` },
                    { name: "**__Cached Bot Members:__**", value: `${guild.members.cache.filter(member => member.user.bot).size === 0 ? guild.members.cache.filter(member => member.user.bot).size : '0'}` },
                    { name: "**__Cached Channels:__**", value: `${guild.channels.cache.size === 0 ? guild.channels.cache.size : '0'}` },
                    { name: "**__Cached Text Channels:__**", value: `${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size === 0 ? guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size : '0'}` },
                    { name: "**__Cached Voice Channels:__**", value: `${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size === 0 ? guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size : '0'}` },
                    { name: "**__Created On:__**", value: `${guild.createdAt.toDateString()}` }
                ]);
            message.channel.send({ embeds: [embed] });
        }).catch(err => {
            if (err.message === `Missing Access`) return mainFuncs.send(message, `Can't fetch guilds im not in.`);
            mainFuncs.send(message, `Invalid guild Id.`);
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        });
    }
};