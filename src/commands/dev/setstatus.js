const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'setstatus',
    aliases: ["setstatus"],
    description: 'For the bot devs',
    usage: 'setstatus Hello Word',
    cooldownTime: '1',
    group: 'dev',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const setGame = args.slice(2).join(` `);
        if (!setGame) return mainFuncs.send(message, "Need to include a status.");
        if (message.author.id !== "130515926117253122" && message.author.id !== "307472480627326987") return message.channel.send("Only the bot developers can use this command.");
        try {
            bot.user.setPresence({ activities: [{ name: `${setGame}`, type: `${args[0]}` }], status: `${args[1]}` });
            mainFuncs.send(message, `Bots game status set.\`\`\`\nStatus: ${args[1]}\nName: ${setGame}\nType ${args[0]}.\`\`\``);
          } catch (err) {
            console.error(err.stack);
          }
    }
};