const { readdirSync } = require('fs');

const EVENT_CATEGORIES = ["client", "guild"];

module.exports = (bot) => {
    for (const category of EVENT_CATEGORIES) {
        const events = readdirSync(`./src/events/${category}`);

        for (const event of events) {
            if (!event.endsWith(".js")) return;

            const fileName = event.split(".")[0];
            const props = require(`../events/${category}/${fileName}`);
            if (!props) return;

            if (fileName === 'ready') {
                bot.once(fileName, props.bind(null, bot));
            } else {
                bot.on(fileName, props.bind(null, bot));
            }
        }
    }
};