const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const request = require('node-superfetch');

module.exports = {
    name: "meme",
    description: "Sends a meme",
    botPermissions: ['none'],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        try {
            const { body } = await request
                .get("https://www.reddit.com//user/kerdaloo/m/dankmemer/top/.json?sort=top&t=day&limit=500");
            if (!body) return interaction.followUp({ content: `Error connecting to Reddits API.` });
            const posts = interaction.channel.nsfw ? body.data.children.filter(post => post.data.ups >= 5000) : body.data.children.filter(post => !post.data.over_18 && post.data.ups >= 5000 && post.data.post_hint === 'image');
            const pickImage = Math.floor(Math.random() * posts.length);
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle(posts[pickImage].data.title)
                .setImage(posts[pickImage].data.url.replace('gifv', 'gif'))
                .setURL(`https://www.reddit.com${posts[pickImage].data.permalink}`)
                .setFooter({ text: `Upvotes: ${posts[pickImage].data.ups}` });
            interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
        }
    }
};