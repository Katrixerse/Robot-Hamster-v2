const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const responses = [
    `● It is certain.`,
    `● It is decidedly so.`,
    `● Without a doubt.`,
    `● Yes - definitely.`,
    `● You may rely on it.`,
    `● As I see it, yes.`,
    `● Most likely.`,
    `● Outlook good.`,
    `● Yes.`,
    `● Signs point to yes.`,
    `● Reply hazy, try again.`,
    `● Ask again later.`,
    `● Better not tell you now.`,
    `● Cannot predict now.`,
    `● Concentrate and ask again.`,
    `● Don't count on it.`,
    `● My reply is no.`,
    `● My sources say no.`,
    `● Outlook not so good.`,
    `● Very doubtful.`
];


module.exports = {
    name: "8ball",
    description: "Ask the 8ball a question",
    botPermissions: ['none'],
    options: [{
        name: "question",
        description: "Provide a question",
        type: ApplicationCommandOptionType.String,
        required: true
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        try {
            const getQuestion = await interaction.options.getString("question");
            const response = responses[Math.floor(Math.random() * responses.length)];
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setColor(`#F49A32`)
                .setFooter({ text: client.user.username })
                .setTitle(`Magic 8ball`)
                .addFields([
                    { name: `Question`, value: `${getQuestion.endsWith("?") ? getQuestion : getQuestion + "?"}`, inline: false },
                    { name: `Answer`, value: `${response}`, inline: false }
                ])
                .setThumbnail(client.user.avatarURL());
            return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
            console.error(err);
        }
    }
};