const { EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");

module.exports = {
    name: 'serverpassword',
    aliases: ["svrpass"],
    description: 'Allows Staff to set a password to the server',
    usage: 'svrpass',
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

                ih.makeNewButtonInteraction("Change password", ButtonStyle.Primary, state, "password");

                ih.makeNewButtonInteraction("Info", ButtonStyle.Primary, state, "info");

                const row = ih.return_row();

                return [row];
            };

            const status = ["**Waiting for input..**"];

            const embed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setDescription(`__**Server Password**__\n\n**What would you like to do?**\n\n__**STATUS**__\n${status.join("\n")}`);

            const init = await message.channel.send({
                embeds: [embed],
                components: components(false)
            });

            let counter = 0;

            const filter = m => m.author.id === message.author.id;

            const on_collect = (Interaction, collector) => {

                if (Interaction.customId == "toggle") {
                    if (counter >= 5) return collector.stop();
                    con.query(`SELECT * FROM serverTfa WHERE guildId="${message.guild.id}"`, (e, srvPass) => {
                        srvPass = srvPass[0];

                        const opposite_value = srvPass.enabled == "true" ? "false" : "true";

                        con.query(`UPDATE serverTfa SET enabled="${opposite_value}" WHERE guildId="${message.guild.id}"`);

                        status.push(`**Server password is now ${srvPass.enabled == "true" ? "enabled" : "disabled"}**`);

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Server Password**__\n\n**What would you like to do?**\n\n__**STATUS**__\n${status.join("\n")}`);


                        Interaction.update({
                            embeds: [embed]
                        });

                        counter++;
                    });
                } else if (Interaction.customId == "password") {
                    collector.stop("artificial");

                    status.push("**:warning: Waiting for you to enter a password.. :warning:**");

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**Server Password**__\n\n**What would you like to do?**\n\n__**STATUS**__\n${status.join("\n")}`);

                    Interaction.update({
                        embeds: [embed]
                    });

                    message.channel.awaitMessages({
                        filter,
                        time: 60000,
                        max: 1
                    }).then(resp => {
                        resp = resp.first();

                        const check = resp.content.replace(/[^\x00-\x7F]/g, "");
                        if (check.length < 1) return mainFuncs.send(message, "Password can't have ASCII characters.");

                        if (resp.content.length > 32) return mainFuncs.send(message, "Server password can't be longer than 32 characters.");

                        con.query(`UPDATE serverTfa SET code=${con.escape(resp.content)} WHERE guildId="${message.guild.id}"`);

                        status.push("**:white_check_mark: Successfully updated password. :white_check_mark:**");

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`__**Server Password**__\n\n**What would you like to do?**\n\n__**STATUS**__\n${status.join("\n")}`);

                        if (init.editable) init.edit({ embeds: [embed] });
                    }).catch(() => {
                        const embed1 = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**You ran out of time.**`);

                        if (init.editable) init.edit({ embeds: [embed1] });
                    });
                } else if (Interaction.customId == "info") {
                    status.push("**Server password is a way to prevent raids and unwanted visitors. Every time someone joins the server, they will be asked to enter the code you set before being able to talk. If they fail to do so or ran out of time, they will be kicked.**");

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`__**Server Password**__\n\n**What would you like to do?**\n\n__**STATUS**__\n${status.join("\n")}`);

                    if (init.editable) init.edit({ embeds: [embed] });
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