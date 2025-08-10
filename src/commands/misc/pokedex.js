const { EmbedBuilder } = require("discord.js");
const request = require("node-superfetch");

const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'pokedex',
    aliases: ["pokedex"],
    description: 'Get information about a pokemon.',
    usage: 'pokedex <name>',
    cooldownTime: '1',
    group: 'misc',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const pokemon = args.join(` `);
        if (!pokemon) return mainFuncs.sendUsage(message, prefix, 'Need to provide a pokemon name.', 'name');
        try {
            const { body } = await request
                .get(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
            const getValues = Object.values(body[0]);
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle("Pokédex")
                .setThumbnail(getValues[16])
                .setDescription(`
                      **ID**: ${getValues[0]}
                      **Name**: ${getValues[1]}
                      **Species**: ${getValues[2]}
                      **Type(s)**: ${getValues[3]}
                      **Abilities(normal)**: ${getValues[4].normal}
                      **Abilities(hidden)**: ${getValues[4].hidden}
                      **Egg group(s)**: ${getValues[5]}
                      **Gender**: ${getValues[6]}
                      **Height**: ${getValues[7]} foot tall
                      **Weight**: ${getValues[8]}
                      **Current Evolution Stage**: ${getValues[9].evolutionStage}
                      **Evolution Line**: ${getValues[9].evolutionLine}
                      **Is Starter?**: ${getValues[10]}
                      **Is Legendary?**: ${getValues[11]}
                      **Is Mythical?**: ${getValues[12]}
                      **Is Generation?**: ${getValues[15]}`);
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            if (err.status === 404) return mainFuncs.send(message, `Pokemon was not found, please try again.`);
            console.log(err)
        }
    }
};