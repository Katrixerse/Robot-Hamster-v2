const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const moment = require("moment");
const mainFuncs = require("../functions/mainFuncs");

class Ticket {
    constructor(message, con, subject, user = undefined) {
        this.message = message;
        this.con = con;
        this.channel = undefined;
        this.subject = subject;
        this.user = user;
    }

    create() {
        // check if the bot can see the channel

        // MAKE IT SO THE SET ROLE CAN SEE THE CHANNEL
        this.con.query(`SELECT svrTck.roles, svrTck.ticketNumber, svrTckOpt.content, svrTckOpt.field_name, svrTckOpt.field_val FROM serverTickets as svrTck LEFT JOIN serverTicketOpts as svrTckOpt ON svrTck.guildId = svrTckOpt.guildId WHERE svrTck.guildId='${this.message.guild.id}'`, async (e, svrTcks) => {
            if (!svrTcks || svrTcks.length == 0) return this.message.channel.send(`A ticket-role could not be found for this guild (it was not set by an admin). Please ask an admin to use the command ticketroles`);
            svrTcks = svrTcks[0];
            const roles = svrTcks.roles.split("|");

            const getId = this.user !== undefined ? this.user.id : this.message.author.id;

            // check if they already have an open ticket.
            this.con.query(`SELECT * FROM serverOpenedTickets WHERE guildId ="${this.message.guild.id}" AND userId="${getId}"`, async (err, rows) => {
                if (err) return console.log(`Error in tickets handler \nDetails: ${err.stack}`);
                if (!rows) return;
                if (rows.length >= 1) {
                    const checkChannel = this.message.guild.channels.cache.find(ch => ch.id == rows[0].channelId);
                    if (checkChannel) {
                        return mainFuncs.send(this.message, `<@${getId}>, please close your last ticket or ask a staff member to before opening a new one.`, 10);
                    } else {
                        return this.con.query(`DELETE FROM serverOpenedTickets WHERE guildId="${this.message.guild.id}" AND userId="${getId}"`);
                    }
                }

                const c_type = ChannelType.guildText;

                const permOverwrites = [];

                // MAKE IT SO THE USER CAN SEE THE CHANNEL

                permOverwrites.push({
                    id: this.user !== undefined ? this.user.id : this.message.author.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                });

                permOverwrites.push({
                    id: this.message.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                });

                // MAKE IT SO THE ROLES CAN SEE THE CHANNEL

                roles.forEach(role => {
                    role = role.replace("ANY ROLE", "@everyone");
                    const guild_role = this.message.guild.roles.cache.find(r => r.name == role);
                    if (!guild_role) return;
                    if (role.includes('@everyone')) return;
                    permOverwrites.push({
                        id: guild_role.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    });
                });

                const guild_channels = await this.message.guild.channels.fetch().catch(console.error);
                const parent = guild_channels.find(c => c.name.toUpperCase() == "TICKETS" && c.type == ChannelType.GuildCategory);
                if (!parent) {
                    const ticket_channel = await this.message.guild.channels.create({
                        name: `ticket-${svrTcks.ticketNumber + 1}`,
                        type: c_type,
                        permissionOverwrites: permOverwrites
                    });

                    this.channel = ticket_channel;
                    const dateNow = new Date();

                    if (!this.message.guild.members.me.permissionsIn(this.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
                    this.con.query("INSERT INTO serverOpenedTickets (guildId, userId, channelId, openedDate) VALUES (?, ?, ?, ?)", [this.message.guild.id, getId, this.channel.id, `${moment(dateNow).format("DD/MM/YYYY")}`]);
                    this.con.query(`UPDATE serverTickets SET ticketNumber = ${svrTcks.ticketNumber + 1} WHERE guildId = "${this.message.guild.id}" `);
                    this.send_message();
                } else {
                    const ticket_channel = await this.message.guild.channels.create({
                        name: `ticket-${svrTcks.ticketNumber + 1}`,
                        type: c_type,
                        parent: parent,
                        permissionOverwrites: permOverwrites
                    });

                    this.channel = ticket_channel;
                    const dateNow = new Date();

                    if (!this.message.guild.members.me.permissionsIn(this.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
                    this.con.query("INSERT INTO serverOpenedTickets (guildId, userId, channelId, openedDate) VALUES (?, ?, ?, ?)", [this.message.guild.id, getId, this.channel.id, `${moment(dateNow).format("DD/MM/YYYY")}`]);
                    this.con.query(`UPDATE serverTickets SET ticketNumber = ${svrTcks.ticketNumber + 1} WHERE guildId = "${this.message.guild.id}" `);
                    this.send_message(svrTcks);
                }
            });
        });
    }

    send_message(svrTcks) {
        let ticketRoles = [];
        svrTcks.roles.split("|").forEach(role => {
            const guild_role = this.message.guild.roles.cache.find(r => r.name == role);
            if (!guild_role) return;
            if (role.includes('@everyone')) return;
            ticketRoles.push(`<@&${guild_role.id}>`);
        });

        const embed = new EmbedBuilder()
            // DO NOT REMOVE THE • AS IT HELPS IN ticketroles FOR FINDING THIS EMBED
            .setDescription(`•Ticket created for reason: **${this.subject}**\n•${ticketRoles} can now help you in regards to this.\n\n•Mods can use **ticketoptions** to see options.`)
            .setTimestamp()
            .setColor(0x0000ff)
            .addFields([{
                name: "Opened by:",
                value: `${this.user !== undefined ? this.user.displayName : this.message.author.username}`,
                inline: true
            }]);
        if (!svrTcks || svrTcks.length == 0) {
            this.channel.send({
                embeds: [embed]
            });
        } else {
            if (svrTcks.field_name !== "none" && svrTcks.field_val !== "none") {
                embed.addFields([{
                    name: svrTcks.field_name,
                    value: `${svrTcks.field_val}`,
                    inline: true
                }]);
            }

            if (svrTcks.content !== "none") {
                this.channel.send({
                    embeds: [embed],
                    content: svrTcks.content
                });
            } else {
                this.channel.send({
                    embeds: [embed]
                });
            }
        }
    }
}

module.exports = Ticket;