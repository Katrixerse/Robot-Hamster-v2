const { EmbedBuilder } = require('discord.js');
const request = require('node-superfetch');

module.exports = {
    checkPosts: async (bot, guild, con) => {
        const fetchNewPosts = setInterval(async () => {
            con.query(`SELECT * FROM serverReddit WHERE guildId = "${guild.id}" LIMIT 1`, async (err, row) => {
                if (!row || row.length === 0) return;
                if (row[0].recieveFeed === 'off') return clearInterval(fetchNewPosts);
                const { body } = await request
                    .get(`https://www.reddit.com/r/${row[0].subReddit}/new.json?limit=3`);
                if (!body) return;
                if (row[0].lastPost === "none" || row[0].lastPost < body.data.children[0].data.created_utc) {
                    const posts = body.data.children.filter(post => !post.data.over_18 && !post.data.post_hint?.includes('video'));
                    if (!posts[0]) return;
                    const embed = new EmbedBuilder();
                    embed.setColor(`#F49A32`);
                    embed.setTitle(posts[0].data.title);
                    embed.setDescription(`Posted by: r/${posts[0].data.author}`);
                    embed.setURL(`https://www.reddit.com${posts[0].data.permalink}`);
                    embed.setFooter({
                        text: `Upvotes: ${posts[0].data.ups} | Posted at: ${new Date(posts[0].data.created_utc * 1000).toLocaleString()}`
                    });
                    if (posts[0].data.post_hint === 'image') embed.setImage(posts[0].data.url.replace('gifv', 'gif'));
                    if (posts[0].data.selftext != "") embed.setDescription(posts[0].data.selftext);
                    const getChannel = guild.channels.cache.get(row[0].feedChannel);
                    con.query(`UPDATE serverReddit SET lastPost="${body.data.children[0].data.created_utc}" WHERE guildId="${guild.id}"`);
                    if (getChannel) return getChannel.send({
                        embeds: [embed]
                    });
                } else {
                    return;
                }
            });
        }, 60000 * 3);
    },
};