const fs = require('fs');
module.exports = {
    name: 'reload',
    aliases: ["reload"],
    description: 'For the bot devs',
    usage: 'reload info ping',
    cooldownTime: '1',
    group: 'dev',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (message.author.id !== "130515926117253122" && message.author.id !== "307472480627326987") return message.channel.send("Only the bot developers can use this command.");
        try {
            const groupName = args[0];
            let commandName = args[1];
            if (!groupName) return message.channel.send('***You need to provide a command category, stupid not having very nice ass and in the same time being an idiot.***');
            if (!bot.commands.has(commandName) && !bot.aliases.has(commandName)) {
                return message.channel.send("***That command does not exist.***");
            } else if (!bot.commands.has(commandName) && bot.aliases.has(commandName)) {
                commandName = bot.commands.get(bot.aliases.get(commandName)).config.name;
            }
            delete require.cache[require.resolve(`../${groupName}/${commandName}.js`)];
            bot.commands.delete(commandName);
            const props = require(`../${groupName}/${commandName}.js`);
            bot.commands.set(commandName, props);
            message.channel.send(`***The command ${commandName} has been reloaded.***`);
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};