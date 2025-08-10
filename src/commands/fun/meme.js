const { EmbedBuilder } = require("discord.js");
const request = require('node-superfetch');
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'meme',
    aliases: ["meme"],
    description: 'Sends a meme',
    usage: 'meme',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const { body } = await request
                .get("https://www.reddit.com//user/kerdaloo/m/dankmemer/top/.json?sort=top&t=day&limit=500");
            if (!body) return mainFuncs.send(message, `Error connecting to Reddits API.`);
            const posts = message.channel.nsfw ? body.data.children.filter(post => post.data.ups >= 1000) : body.data.children.filter(post => !post.data.over_18 && post.data.ups >= 1000 && post.data.post_hint === 'image');
            const pickImage = Math.floor(Math.random() * posts.length);
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle(posts[pickImage].data.title)
                .setImage(posts[pickImage].data.url.replace('gifv', 'gif'))
                .setURL(`https://www.reddit.com${posts[pickImage].data.permalink}`)
                .setFooter({ text: `Upvotes: ${posts[pickImage].data.ups}` });
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
        }
    }
};