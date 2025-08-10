const { readdirSync } = require('fs');
const botinfo = require('../commands/info/botinfo');

const COMMAND_CATEGORIES = ["fun", "info", "leveling", "mod"];

const slash = [];

module.exports = async (bot) => {
    for (const category of COMMAND_CATEGORIES) {
        const commands = readdirSync(`./src/slashCommands/${category}`);

        for (const command of commands) {
            if (!command.endsWith(".js")) return;

            const fileName = command.split(".")[0];
            const props = require(`../slashCommands/${category}/${fileName}`);
            if (!props) return;
            bot.slashCommands.set(fileName, props);
            slash.push(props);
        }
    }
    bot.on("ready", async () => {
        await bot.application.commands.set(slash);
    });
};