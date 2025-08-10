const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { addGuild } = require('../../handlers/handleTables');

const sendToChannel = (bot, guild) => {
    console.log("guildCreate.js: sendToChannel function called.");
    bot.guilds.fetch("790216912160161803").then(g => {
        if (!g) return;
        const ch = g.channels.cache.get("881484473517101066");
        const embed = new EmbedBuilder()
            .setTitle('New guild added.')
            .setColor(0x00FF00)
            .setDescription(`Owner: ${guild.ownerId}\nName: ${guild.name}\nID: ${guild.id}\nMembercount: ${guild.memberCount}`);
        ch.send({ embeds: [embed] });
    });
};

const sendNewMessage = (bot, guild) => {
    guild.channels.fetch().catch(console.error);
    const getChannel = guild.channels.cache.find(c => c.name === 'general' && c.type === ChannelType.GuildText);
    if (!getChannel) return;

    if (!guild.members.me.permissionsIn(getChannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) return;

    const embed = new EmbedBuilder()
        .setTitle('Thank you for adding me!')
        .setColor(`#F49A32`)
        .setDescription(`**__About:__**\nHello, I am **${bot.user.username}** and I am a multipurpose bot. I have many commands and features that you can use. You can see all my commands by typing \`r!help\` in any channel. If you need info on a certain command, you can type \`/help <command>\`, If you ever need further assistance you can join our support server linked in this message.`)
        .addFields([
            { name: 'A few tips to help get you started..', value: `**1.** My default prefix is \`r!\` but you can change it with r!prefix or /prefix.\n**2.** Manage welcome system with r!mwl.\n**3.** Manage log settings with r!ml.\n**5.** Set autorole with r!mar.\n**4.** Leveling can be managed with r!mlv.` },
            { name: '**__Important links:__**', value: `[Support Server](https://discord.gg/uF7S2mCEqD)\n[Website](https://www.robothamster.ca/)\n[Privacy Policy](https://robothamster.ca/privacy-policy)\n[Terms of service](https://robothamster.ca/tos)` }
        ])
        .setFooter({ text: 'Thank you for choosing Robot Hamster!' });
    getChannel.send({ embeds: [embed] });
};

module.exports = async (bot, guild) => {
    if (guild.available === false || guild.name === undefined) return;
    if (guild.id === '790216912160161803') return;
    sendToChannel(bot, guild);
    sendNewMessage(bot, guild);
    await addGuild(guild.name, guild.id);
};