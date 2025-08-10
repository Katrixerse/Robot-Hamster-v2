const { EmbedBuilder } = require("discord.js");
const request = require('node-superfetch');
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'cat',
    aliases: ["cat"],
    description: 'Sends a random cat picture',
    usage: 'cat',
    cooldownTime: '1',
    group: 'fun',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        try {
            const { body } = await request
                .get("https://www.reddit.com/r/cats.json?sort=top&t=week&limit=500");
            if (!body) return mainFuncs.send(message, `Error connecting to Reddits API.`);
            const posts = body.data.children.filter(post => !post.data.over_18 && post.data.ups >= 100 && post.data.post_hint === 'image');
            const pickImage = Math.floor(Math.random() * posts.length);
            const embed = new EmbedBuilder()
                .setColor(`#F49A32`)
                .setTitle(posts[pickImage].data.title.substring(0, 255))
                .setImage(posts[pickImage].data.url.replace('gifv', 'gif'))
                .setURL(`https://www.reddit.com${posts[pickImage].data.permalink}`)
                .setFooter({ text: `Upvotes: ${posts[pickImage].data.ups}` });
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
        }
    }
};