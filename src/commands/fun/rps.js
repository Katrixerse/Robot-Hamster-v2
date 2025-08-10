const { EmbedBuilder, ButtonStyle } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
    name: 'rps',
    aliases: ["rps"],
    description: 'Play rock paper scissors with the bot.',
    usage: 'rps <choice>',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        const validPicks = ["rock", "paper", "scissors"];
        //Rock

        const IH = require("../../handlers/interactions").IH;

        const ih = new IH(message);

        const components = (state) => {
            ih.create_row();

            ih.makeNewButtonInteraction("Rock", ButtonStyle.Primary, state, "rock");

            ih.makeNewButtonInteraction("Paper", ButtonStyle.Primary, state,  "paper");

            ih.makeNewButtonInteraction("Scissors", ButtonStyle.Primary, state, "scissors");

            const row = ih.return_row();

            return [row];
        };

        const status = ["**Waiting for input..**"];

        const embed = new EmbedBuilder()
            .setColor(0x0000ff)
            .setDescription(`__**Rock Paper Scissors**__\n\n**What would you like to choose?**\n\n__**STATUS**__\n${status.join("\n")}`);

        const init = await message.channel.send({
            embeds: [embed],
            components: components(false)
        });

        const on_collect = (Interaction, collector) => {

            if (Interaction.customId == "rock") {
                const botPicked = validPicks[Math.floor(Math.random() * validPicks.length)];
                if (botPicked == "rock") status.push(`You picked rock and I picked ${botPicked}. It's a tie!`);
                if (botPicked == "paper") status.push(`You picked rock and I picked ${botPicked}. You beat me! :rage:`);
                if (botPicked == "scissors") status.push(`You picked rock and I picked ${botPicked}. I beat you! :sweat_smile:`);

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`__**Rock Paper Scissors**__\n\n__**STATUS**__\n${status.join("\n")}`);

                Interaction.update({
                    embeds: [embed]
                });
            } else if (Interaction.customId == "paper") {
                const botPicked = validPicks[Math.floor(Math.random() * validPicks.length)];
                if (botPicked == "paper") status.push(`You picked paper and I picked ${botPicked}. It's a tie!`);
                if (botPicked == "rock") status.push(`You picked paper and I picked ${botPicked}. You beat me! :rage:`);
                if (botPicked == "scissors") status.push(`You picked paper and I picked ${botPicked}. I beat you! :sweat_smile:`);

                const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**Rock Paper Scissors**__\n\n__**STATUS**__\n${status.join("\n")}`);

                Interaction.update({
                    embeds: [embed]
                });
            } else if (Interaction.customId == "scissors") {
                const botPicked = validPicks[Math.floor(Math.random() * validPicks.length)];
                if (botPicked == "scissors") status.push(`You picked scissors and I picked ${botPicked}. It's a tie!`);
                if (botPicked == "rock") status.push(`You picked scissors and I picked ${botPicked}. I beat you! :sweat_smile:`);
                if (botPicked == "paper") status.push(`You picked scissors and I picked ${botPicked}. You beat me! :rage:`);

                const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**Rock Paper Scissors**__\n\n__**STATUS**__\n${status.join("\n")}`);

                Interaction.update({
                    embeds: [embed]
                });
            }
    };

    const on_end = reason => {
        if (reason == "artificial") return;
        if (init.editable) init.edit({ components: components(true) });
    };

    ih.create_collector(on_collect, on_end, init);
}
};