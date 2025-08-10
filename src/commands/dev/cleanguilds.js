const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'cleanguilds',
    aliases: ["cleanguilds"],
    description: 'Forces the bot to leave guilds with Insanely high bot to member ratios',
    usage: 'cleanguilds',
    cooldownTime: '25',
    group: 'dev',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (message.author.id !== "130515926117253122") return message.channel.send("Only the bot developers can use this command.");
        bot.guilds.cache.forEach((g) => {
            const bots = g.members.cache.filter(guild => guild.user.bot).size;
            const users = g.members.cache.filter(guild => !guild.user.bot).size;
            const calc = bots / users * 100;
            if (calc >= 100 && users >= 25) {
                if (g.id === `110373943822540800`) return;
                if (g.id === `264445053596991498`) return;
                const checkGuild = bot.guilds.cache.get(g.id);
                checkGuild.leave();
            }
        });
        mainFuncs.send(message, "Kicked the bot automatically from guilds where they have over 80% of the guild members as bots");
    }
};