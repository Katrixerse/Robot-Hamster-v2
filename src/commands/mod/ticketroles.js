const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, RoleSelectMenuBuilder, PermissionFlagsBits, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { con } = require("../../functions/dbConnection");
const mainFuncs = require("../../functions/mainFuncs");
const modFuncs = require("../../functions/modFuncs");
module.exports = {
    name: 'ticketroles',
    aliases: ["tktr"],
    description: 'Manage ticket roles',
    usage: 'ticketroles',
    cooldownTime: '1',
    group: 'mod',
    botPermissions: [PermissionFlagsBits.ManageRoles],
    run: async (bot, prefix, message, args, con) => {
        con.query(`SELECT * FROM serverStaff WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}" AND userRank = "admin"`, (e, staffMembers) => {
            const checkRank = staffMembers != undefined ? staffMembers.length : 0;
            if (!modFuncs.checkPerms(message, PermissionFlagsBits.ManageGuild, checkRank)) return;

            con.query(`SELECT * FROM serverTickets WHERE guildId='${message.guild.id}'`, async (e, rows) => {
                let cur_roles = [];
                if (!rows || rows.length == 0) cur_roles = [];
                else cur_roles = rows[0].roles.split("|");

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Please select which roles will be able to see user-created tickets.**\n\n•**Current roles: ${cur_roles.join(", ")}**`);

                const components = (state) => {
                    const roles = [];
                    message.guild.roles.cache.forEach(r => {
                        if (r.name == "@everyone") {
                            roles.push({ label: "ANY ROLE", value: "ANY ROLE" });
                        } else { 
                            if (roles.length < 25 && !cur_roles.includes(r.name)) {
                                roles.push({ label: r.name, value: r.name });
                            }
                        }
                    });

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId("roles")
                        .setPlaceholder("Select roles")
                        .setDisabled(state)
                        .setMinValues(1)
                        .setMaxValues(roles.length)
                        .addOptions(roles);

                    const selectMenuRow = new ActionRowBuilder();
                    selectMenuRow.addComponents(selectMenu);

                    return [selectMenuRow];
                };

                const initialMessage = await message.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const filter = (Interaction) => Interaction.user.id === message.author.id;

                const collector = message.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                    message: initialMessage
                });

                collector.on("collect", async Interaction => {
                    if (Interaction.customId == "roles") {
                        const selected = Interaction.values.join('|');
                        if (!selected) return Interaction.reply({ content: "You must select at least one role, before clicking done.", ephemeral: true });
                        if (!rows || rows.length == 0) {
                            con.query("INSERT INTO serverTickets (guildId, roles, ticketNumber) VALUES (?, ?, ?)", [message.guild.id, con.escape(selected), 0]);

                            newEmbed = new EmbedBuilder()
                                .setColor(`#F49A32`)
                                .setDescription(`**Please select which roles will be able to see user-created tickets.**\n\n•**Current roles: ${Interaction.values.join(', ')}**`);

                            Interaction.update({
                                embeds: [newEmbed]
                            });
                        } else {
                            con.query(`UPDATE serverTickets SET roles=${con.escape(selected)} WHERE guildId="${message.guild.id}"`);

                            newEmbed = new EmbedBuilder()
                                .setColor(`#F49A32`)
                                .setDescription(`**Please select which roles will be able to see user-created tickets.**\n\n•**Current roles: ${Interaction.values.join(', ')}**`);
                                
                            Interaction.update({
                                embeds: [newEmbed]
                            });
                        }
                    }
                });
                

                collector.on("end", () => {
                    if (initialMessage.editable) initialMessage.edit({ components: components(true, false) });
                });
            });
        });
    }
};