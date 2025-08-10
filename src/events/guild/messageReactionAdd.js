const { con } = require("../../functions/dbConnection");
const { PermissionFlagsBits } = require("discord.js");
module.exports = async (bot, reaction, user) => {
    try {
        if (!user.bot) {
            reaction.message.fetch().then(async m => {
                if (!m) return;
                if (m.embeds.length > 0 && m.embeds[0].title == "Reaction Roles") {
                    if (m.author.id != "491699193585467393") return;
                    if (m.embeds[0].fields.length < 1) return;
                    const role = m.embeds[0].fields.find(f => f.name.startsWith(reaction.emoji.name)).value;
                    const finder = m.guild.roles.cache.find(r => r.name === role);
                    if (!finder) return;
                    const u = await user.fetch();
                    if (!u) return;
                    const member = m.guild.members.cache.find(m => m.id == u.id);
                    if (!member) return;
                    member.roles.add(finder).catch((e) => e);
                }
            }).catch(console.error);
        }
    } catch (err) {
        console.error(err);
    }
};