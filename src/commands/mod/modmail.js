const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'modmail',
    aliases: [],
    description: 'Modmail system',
    usage: 'modmail',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;
            const IH = require("../../handlers/interactions").IH;
            const MM = require("../../handlers/handleModmail").MM;

            const ih = new IH(message);
            const mm = new MM(message);


            const components = async (state) => {
                const hasBeenSetup = await mm.hasBeenSetup();
                ih.create_row();

                const text = hasBeenSetup ? "Setup (already setup)" : "Setup";

                ih.makeNewButtonInteraction(text, ButtonStyle.Primary, state || hasBeenSetup, "setup");

                const row = ih.return_row();

                return [row];
            };

            const status = ["**Waiting for input..**"];

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**MODMAIL**__\n\n**With modmail your members can get help in regards to a subject extremely easily! By DMing me, a message will be sent to the modmail channel, where any staff can help them.\n\n__Start by DMing me .start after setting up.__**\n\n__**STATUS**__\n${status.join("\n")}`);

            const init = await message.channel.send({
                embeds: [embed],
                components: await components(false)
            });

            const on_collect = async (Interaction, collector) => {

                collector.stop("artificial");

                if (Interaction.customId == "setup") {
                    status.push("**:white_check_mark: Modmail has been setup! :white_check_mark:**");

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**MODMAIL**__\n\n**With modmail your members can get help in regards to a subject extremely easily! By DMing me, a message will be sent to the modmail channel, where any staff can help them.\n\n__Start by DMing me .start after setting up.__**\n\n__**STATUS**__\n${status.join("\n")}`);


                    await Interaction.update({
                        components: [],
                        embeds: [embed]
                    });

                    await mm.setup();
                }
            };

            const on_end = async reason => {
                if (reason == "artificial") return;
                if (init.editable) init.edit({ components: await components(true) });
            };

            ih.create_collector(on_collect, on_end, init);
        });
    }
};