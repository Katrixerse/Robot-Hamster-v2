const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: 'servercaptcha',
    aliases: ["svrcaptcha"],
    description: 'Allows Staff to set a captcha to the server',
    usage: 'svrcaptcha',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, async (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            const IH = require("../../handlers/interactions").IH;

            const ih = new IH(message);

            const components = (state) => {
                ih.create_row();

                ih.makeNewButtonInteraction("Enable/Disable", ButtonStyle.Primary, state, "toggle");

                const row = ih.return_row();

                return [row];
            };

            const status = ["**Waiting for input..**"];

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**Server Captcha**__\n\n**What would you like to do?**\n\n__**STATUS**__\n${status.join("\n")}`);

            const init = await message.channel.send({
                embeds: [embed],
                components: components(false)
            });

            let counter = 0;

            const on_collect = (Interaction, collector) => {

                if (Interaction.customId == "toggle") {
                    if (counter >= 5) return collector.stop();
                    con.query(`SELECT * FROM serverSettings WHERE guildId="${message.guild.id}"`, (e, row) => {
                        row = row[0];

                        const opposite_value = row.serverCaptcha == "enabled" ? "disabled" : "enabled";

                        con.query(`UPDATE serverSettings SET serverCaptcha="${opposite_value}" WHERE guildId="${message.guild.id}"`);

                        status.push(`**Server captcha is now ${opposite_value}**`);

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Server Captcha**__\n\n**What would you like to do?**\n\n__**STATUS**__\n${status.join("\n")}`);


                        Interaction.update({
                            embeds: [embed]
                        });

                        counter++;
                    });
                }
            };
            const on_end = reason => {
                if (reason == "artificial") return;
                if (init.editable) init.edit({ components: components(true) });
            };

            ih.create_collector(on_collect, on_end, init);
        });
    }
};