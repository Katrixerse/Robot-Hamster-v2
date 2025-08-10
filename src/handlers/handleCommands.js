const { readdirSync } = require('fs');

const COMMAND_CATEGORIES = ["dev", "economy", "fun", "image", "info", "leveling", "misc", "mod", "roleplay"];

module.exports = (bot) => {
    try {
        for (const category of COMMAND_CATEGORIES) {
            const commands = readdirSync(`./src/commands/${category}`);

            for (const command of commands) {
                if (!command.endsWith(".js")) return;

                const fileName = command.split(".")[0];
                const props = require(`../commands/${category}/${fileName}`);
                if (!props) return;

                bot.commands.set(props.name, props);
                bot.description.set(props.name, props.description);
                bot.cooldownTime.set(props.name, props.cooldownTime);
                props.aliases.forEach((alias) => {
                    bot.aliases.set(alias, props.name);
                });
            }
        }
        console.log(`Loaded ${bot.commands.size} commands!`);
    } catch (err) {
        console.log(err.stack);
    }
};