const { EmbedBuilder, PermissionFlagsBits, ChannelType, ButtonStyle } = require("discord.js");
const { con } = require("../functions/dbConnection");
const mainFuncs = require("../functions/mainFuncs");
const IH = require("./interactions").IH;

class ModMail {
    constructor(message, bot) {
        this.message = message;
        this.author = message.author;
        this.guild = message.guild;
        this.channel = message.channel;
        this.bot = bot;
        this.ih = new IH(message);

        // AUTH
        this.discord_login_url = "https://discord.com/api/oauth2/authorize?client_id=491699193585467393&redirect_uri=https%3A%2F%2Frobothamster.ca%2Foauth2%2Fmodmail%2Fredirect&response_type=code&scope=guilds%20identify";
    }

    searchForModmailC(channels) {
        // SEARCHES FOR THE MODMAIL CATEGORY/MODMAIL LOGS

        const modMailCategory = channels.find(c => c.type == ChannelType.GuildCategory && c.name == "modmail");
        const modMailLogs = channels.find(c => c.type == ChannelType.GuildText && c.name == "modmail-logs");

        return [modMailCategory, modMailLogs];
    }

    async hasBeenSetup() {
        const guild_channels = await this.guild.channels.fetch();

        const [modMailCategory, modMailLogs] = this.searchForModmailC(guild_channels);

        return modMailCategory !== undefined && modMailLogs !== undefined;
    }

    async setup() {
        const guild_channels = await this.guild.channels.fetch();

        const [modMailCategory, modMailLogs] = this.searchForModmailC(guild_channels);

        const permOw = [];

        const everyone = this.guild.roles.cache.find(r => r.name == "@everyone");

        con.query(`SELECT * FROM serverStaff WHERE guildId = "${this.guild.id}" AND userRank = "admin"`, async (e, staffMembers) => {

            staffMembers.forEach(staff => {
                permOw.push({
                    id: staff.userId,
                    allow: [PermissionFlagsBits.ViewChannel]
                });
            });

            permOw.push({
                id: everyone.id,
                deny: [PermissionFlagsBits.ViewChannel]
            });


            if (!modMailCategory) {
                const channelName = "modmail";
                const channelType = ChannelType.GuildCategory;

                this.guild.channels.create({ name: channelName, type: channelType, permissionOverwrites: permOw });
            }
            if (!modMailLogs) {
                const channelName = "modmail-logs";
                const channelType = ChannelType.GuildText;

                const guild_channels = await this.guild.channels.fetch();
                const channelParent = guild_channels.find(c => c.name == "modmail" && c.type == ChannelType.GuildCategory);

                this.guild.channels.create({ name: channelName, type: channelType, parent: channelParent });
            } else {
                const guild_channels = await this.guild.channels.fetch();
                const parent = guild_channels.find(c => c.name == "modmail" && c.type == ChannelType.guildCategory);
                if (!parent) return this.channel.send(`**Could not find the modmail category in ${this.guild.name}. Contact an admin and try again later.**`);
                modMailLogs.setParent(parent);
            }
        });
    }

    async continueHandlingAgain(pref_guild) {
        const modmail_cat = pref_guild.channels.cache.find(c => c.name == "modmail" && c.type == ChannelType.GuildCategory);
        if (!modmail_cat) return this.channel.send(`**Could not find the modmail category in ${this.guild.name}. Contact an admin and try again later.**`);
        let user_channel = pref_guild.channels.cache.find(c => c.name == this.author.username.toLowerCase().substring(0, 15).replace(/\s/g, "-"));

        const logs_channel = pref_guild.channels.cache.find(c => c.name == "modmail-logs");

        let cur_message = "_";
        let images;

        const embed = new EmbedBuilder()
            .setColor(0x0000ff)
            .setDescription(`**Currently selected guild:** __${pref_guild.name}__\n\n**Current message:** __${cur_message}__\n**Current image:** __${!images ? "none" : images.first().name}__\n\n\n**Once you send a message, this embed will update and you will be able to press the send button to send it.**`);

        const components = (state) => {
            this.ih.create_row();

            this.ih.makeNewButtonInteraction("Create ticket", ButtonStyle.Primary, state || user_channel !== undefined, "create", "✅");

            this.ih.makeNewButtonInteraction("Send message", ButtonStyle.Primary, state || cur_message == "_" || user_channel == undefined, "send", "📨");

            this.ih.makeNewButtonInteraction("Change guild", ButtonStyle.Primary, state, "change", "🔁");

            this.ih.makeNewButtonInteraction("Close ticket", ButtonStyle.Primary, state || user_channel == undefined, "close", "❌");

            const row = this.ih.return_row();

            return [row];
        };
        
        if (!this.guild.members.me.permissionsIn(this.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

        const init = await this.channel.send({
            components: components(false),
            embeds: [embed]
        });

        let ticket_closed = false;

        const on_collect = async (Interaction, collector) => {
            if (Interaction.customId == "create") {
                const logs_embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setTimestamp()
                    .setTitle(`Ticket Created`)
                    .setAuthor({ name: this.author.username, iconURL: this.author.avatarURL() })
                    .addFields([
                        { name: `Created by`, value: `${this.author.username}` }
                    ]);
                if (logs_channel) logs_channel.send({ embeds: [logs_embed] });
                user_channel = await pref_guild.channels.create({ name: this.author.username.toLowerCase().substring(0, 15), type: ChannelType.GuildText, parent: modmail_cat });

                Interaction.update({
                    components: components(false)
                });
            } else if (Interaction.customId == "send") {
                let send_embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setAuthor({ name: this.author.username, iconURL: this.author.avatarURL() })
                    .setTitle(`Message Received`)
                    .setTimestamp()
                    .setDescription(cur_message);

                if (images) send_embed = send_embed.setImage(images.first().url);

                user_channel.send({
                    embeds: [send_embed]
                });

                cur_message = "_";
                images = undefined;


                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Currently selected guild:** __${pref_guild.name}__\n\n**Current message:** __${cur_message}__\n**Current image:** __${!images ? "none" : images.first().name}__\n\n\n**Once you send a message, this embed will update and you will be able to press the send button to send it. However, you have to create a ticket first.**`);

                Interaction.update({
                    components: components(false),
                    embeds: [embed]
                });
            } else if (Interaction.customId == "close") {

                collector.stop();

                const close_embed_user = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription(`**Your ticket has been closed.**`);
                const close_embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle(`Ticket Closed`)
                    .setTimestamp()
                    .setDescription(`Ticket for ${this.author.username} has been closed.`);

                user_channel.delete();

                ticket_closed = true;

                logs_channel.send({ embeds: [close_embed] });

                Interaction.update({
                    embeds: [close_embed_user],
                    components: []
                });
            } else {

                ticket_closed = true;

                collector.stop();

                con.query(`DELETE FROM userGuilds WHERE userId="${this.author.id}"`);
                con.query(`DELETE FROM userPrefGuilds WHERE userId="${this.author.id}"`);

                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setDescription(`**Guild prefrences have been deleted. Please use start again to reselect guilds.**`);

                Interaction.update({
                    components: [],
                    embeds: [embed]
                });
            }
        };

        const on_end = reason => {
            if (init.editable) init.edit({ components: components(true) });
        };

        this.ih.create_collector(on_collect, on_end, init);

        const filter = m => m.author.id === this.author.id;

        const reload = () => {
            this.channel.awaitMessages({
                filter,
                time: 60000,
                max: 1
            }).then(resp => {
                if (ticket_closed) return;
                resp = resp.first();

                cur_message = resp.content;
                if (resp.attachments.size > 0) images = resp.attachments;

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Currently selected guild:** __${pref_guild.name}__\n\n**Current message:** __${cur_message}__\n**Current image:** __${!images ? "none" : images.first().name}__\n\n\n**Once you send a message, this embed will update and you will be able to press the send button to send it.**`);

                if (init.editable) init.edit({ embeds: [embed], components: components(false) });

                reload();
            }).catch(() => {
                //if (!ticket_closed) this.channel.send("**You did not enter a message in time. You will now have to use start again.**");
            });
        };

        reload();
    }

    continueHandling(guilds) {
        con.query(`SELECT * FROM userPrefGuilds WHERE userId='${this.author.id}'`, async (e, rows) => {
            let pref_guild;
            if (!rows || rows.length == 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**Please select which guild you would like to send a mail to.**`);

                const components = (state) => {
                    this.ih.create_row();

                    const opts = guilds.map(g => {
                        return {
                            label: g.name,
                            value: g.id
                        };
                    });

                    this.ih.makeNewSelectInteraction("guild-select", "Select a guild...", state, opts);

                    const row = this.ih.return_row();

                    return [row];
                };

                const mes = await this.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const on_collect = async (Interaction, collector) => {
                    collector.stop();

                    const selected = Interaction.values[0];

                    const g_name = this.bot.guilds.cache.get(selected).name;

                    const g = this.bot.guilds.cache.get(selected);

                    const embed = new EmbedBuilder()
                        .setColor(0x0000ff)
                        .setDescription(`**${g_name} has been selected.\n\nYou can now start talking in here and wait for the staff to respond.**`);

                    await Interaction.update({
                        components: [],
                        embeds: [embed]
                    });

                    if (!rows || rows.length == 0) {
                        con.query("INSERT INTO userPrefGuilds (userId, guild) VALUES (?, ?)", [this.author.id, selected]);
                    } else {
                        con.query(`UPDATE userPrefGuilds SET guild="${selected}" WHERE userId='${this.author.id}'`);
                    }

                    await this.continueHandlingAgain(g);
                };
                const on_end = reason => {
                    if (reason == "artificial");
                    if (mes.editable) mes.edit({ components: components(true) });
                };

                this.ih.create_collector(on_collect, on_end, mes);
            } else {
                rows = rows[0];
                pref_guild = this.bot.guilds.cache.get(rows.guild);

                await this.continueHandlingAgain(pref_guild);
            }
        });
    }

    async handleModMail() {
        con.query(`SELECT * FROM userGuilds WHERE userId='${this.author.id}'`, async (e, rows) => {
            if (!rows || rows.length == 0) {
                const components = (state) => {
                    this.ih.create_row();

                    this.ih.makeNewButtonInteraction("Authorize", ButtonStyle.Link, state, undefined, undefined, this.discord_login_url);

                    this.ih.makeNewButtonInteraction("Done", ButtonStyle.Success, state, "done");

                    const row = this.ih.return_row();

                    return [row];
                };

                const embed = new EmbedBuilder()
                    .setColor(0x0000ff)
                    .setDescription(`**In order to access the guilds you're in, I need your consent. Please click the button below to authorize, then click __Done__.**`);

                const init = await this.channel.send({
                    embeds: [embed],
                    components: components(false)
                });

                const on_collect = (Interaction, collector) => {
                    collector.stop();
                    con.query(`SELECT * FROM userGuilds WHERE userId='${this.author.id}'`, (e, rows) => {

                        if (!rows || rows.length == 0) return Interaction.reply("**Failed to fetch auth**");

                        rows = rows[0];

                        console.log(rows.guilds)
                        const guilds = rows.guilds.split("|").map(x => {
                            const guild = this.bot.guilds.cache.get(x);
                            if (!guild) return;

                            return guild;
                        });

                        const embed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setDescription(`**Authorization complete, thank you.**`);

                        Interaction.update({
                            components: [],
                            embeds: [embed]
                        });

                        const guilds_format = guilds.map(x => {
                            return {
                                name: x.name,
                                id: x.id
                            };
                        });

                        this.continueHandling(guilds_format);
                    });
                };

                const on_end = reason => {
                    if (init.editable) init.edit({ components: components(true) });
                };

                this.ih.create_collector(on_collect, on_end, init);
            } else {
                rows = rows[0];
                const guilds = rows.guilds.split("|").map(x => {
                    const guild = this.bot.guilds.cache.get(x);
                    if (!guild) return;

                    return guild;
                });

                const guilds_format = guilds.map(x => {
                    return {
                        name: x.name,
                        id: x.id
                    };
                });

                this.continueHandling(guilds_format);
            }
        });
    }
}

module.exports.MM = ModMail;