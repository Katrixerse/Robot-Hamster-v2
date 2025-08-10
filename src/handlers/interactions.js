const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");

class IH {
    constructor(message) {
        this.message = message;
        this.filter = (Interaction) => Interaction.user.id === message.author.id;
        this.row = undefined;
    }

    create_row() {
        if (!this.row) this.row = new ActionRowBuilder();
    }

    return_row() {
        const toReturn = this.row;
        this.row = undefined;

        return toReturn;
    }

    makeNewButtonInteraction(label, style, disabled, id = undefined, emoji = undefined, url = undefined) {
        if (this.row) {
            const Button = new ButtonBuilder();
            Button.setLabel(label);
            Button.setStyle(style);
            Button.setDisabled(disabled);

            if (id != undefined) {
                Button.setCustomId(id);
            }

            if (emoji != undefined) {
                Button.setEmoji(emoji);
            }
            if (url != undefined) {
                Button.setURL(url);
            }

            this.row.addComponents(Button);
        }
    }

    makeNewSelectInteraction(id, placeholder, disabled, options) {
        if (this.row) {
            const test = options.slice(0, 25);
            const Select = new StringSelectMenuBuilder()
                .setDisabled(disabled)
                .setPlaceholder(placeholder)
                .setCustomId(id)
                .addOptions(test || options);
            this.row.addComponents(Select);
        }
    }

    create_collector(on_collect, on_end, message, filter = this.filter) {
        const collector = this.message.channel.createMessageComponentCollector({
            filter,
            time: 60000,
            message: message
        });

        collector.on("collect", async Interaction => await on_collect(Interaction, collector));
        collector.on("end", async (_, r) => await on_end(r));
    }
}

class IEmbed {
    constructor(message, title, description, components = [], fields = []) {
        this.message = message;
        this.components = components;
        this.status = ["Waiting for input.."];
        this.description = description;
        this.embed = new EmbedBuilder()
            .setTitle(title)
            .setColor("#F49A32")
            .setDescription(description + `\n\n__**STATUS**__\n${this.status.join("\n")}`);
        if (fields) this.embed.setFields(fields);
    }

    async send() {
        const init = await this.message.channel.send({ embeds: [this.embed], components: this.components });
        this.init = init;

        return init;
    }

    async edit(components) {
        if (this.init.editable) {
            await this.init.edit({ embeds: [this.embed], components: components });
        }
    }

    async updateDescription(text) {
        this.description = text;
        this.embed.setDescription(text + `\n\n__**STATUS**__\n${this.status.join("\n")}`);

        if (this.init.editable) {
            await this.init.edit({ embeds: [this.embed] });
        }
    }

    async updateStatus(status) {
        this.status.push(status);
        this.embed.setDescription(this.description + `\n\n__**STATUS**__\n${this.status.join("\n")}`);

        if (this.init.editable) {
            await this.init.edit({ embeds: [this.embed] });
        }
    }
}

module.exports.IH = IH;
module.exports.IEmbed = IEmbed;