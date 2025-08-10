const { createTables } = require("../../handlers/handleTables");
//const { dbCleanup } = require('../../handlers/dbCleanup.js');
const { setStatus, serverStats, twitchAlerts, giveaways, checkMutes, timedRoles, redditFeed } = require("../../functions/readyFuncs");
const { con } = require("../../functions/dbConnection");
module.exports = async (bot) => {
    setStatus(bot);
    //createTables();

    //reset command list for dashboard
    //con.query(`DELETE FROM botCommands`);
    //bot.commands.forEach(async (command) => {
    //    con.query(`INSERT INTO botCommands (commandName, commandAliases, commandDescription, commandUsage, commandGroup, botPermissions) VALUES ("${command.name}", "${command.aliases}", "${command.description}", "${command.usage}", "${command.group}", "${command.botPermissions}")`);
    //});

    try {
        await bot.guilds.cache.forEach(async guild => {
            /*con.query(`SELECT * FROM serverCategories WHERE guildId ="${guild.id}"`, (e, row) => {
                if (!row || row.length === 0) {
                    console.log(`Added new server (ID: ${guild.id}) to categories table`);
                    con.query("INSERT INTO serverCategories (guildId, economy, fun, info, leveling, moderation, nsfw, roleplay, misc, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [guild.id, "yes", "yes", "yes", "yes", "yes", "yes", "yes", "yes", "yes"]);
                }
            });*/
            if (guild.available) {
                guild.channels.fetch().catch(console.error);
                //serverStats(bot, guild);
                //twitchAlerts(bot, guild);
                //giveaways(bot, guild);
                //timedRoles(bot, guild);
                //redditFeed(bot, guild);
            }
        });
    } catch (error) {
        console.log(error);
    }

   console.log(`${bot.user.username} loaded. Currently in ${bot.guilds.cache.size} server(s) with ${bot.users.cache.size} users cached.`);
};