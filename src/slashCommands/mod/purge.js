const { Client, CommandInteraction, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "purge",
    description: "Purge a number of messages",
    botPermissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
    options: [{
        name: "number",
        description: "amount of messages to delete",
        type: ApplicationCommandOptionType.Integer,
        required: true
    }],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args, con) => {
        if (interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const getNumber = interaction.options.getInteger("number");
            if (getNumber < 2 || getNumber >= 100) return interaction.reply(`Min/Max number of messages is 1/100.`);
            interaction.channel.messages.fetch({
                limit: 100
            }).then(async messages => {
                messages = messages.filter(m => m.author.id != client.user.id).first(getNumber);
                if (messages.length >= 1) {
                    interaction.channel.bulkDelete(messages, true).catch((e) => {
                        console.log("Error: " + e.message)
                        return interaction.reply(`There was an error deleting the messages.`);
                    });
                    interaction.reply(`__${messages.length} message(s) has been deleted.__`);
                } else {
                    interaction.reply(`__No messages found.__`);
                }
            }).catch(console.error);
        }
    }
};