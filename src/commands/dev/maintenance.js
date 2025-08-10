const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const mainFuncs = require("../../functions/mainFuncs");
module.exports = {
    name: 'maintenance',
    aliases: ["mtnce"],
    description: 'Dev command',
    usage: 'mtnce',
    cooldownTime: '5',
    group: 'dev',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (message.author.id !== "130515926117253122") return message.channel.send("Only the bot developers can use this command.");
        con.query(`SELECT * FROM botSettings`, (err, row) => {
            if (err) return console.log(`Error in command: ${this.name} \nDetails: ${err.stack}`);
            if (!row || row.length == 0) {
                con.query(`INSERT INTO botSettings (maintenanceMode, maintenanceETA, maintenanceReason) VALUES (?, ?, ?)`, [`false`, `NA`, `NA`]);
                return message.channel.send(`DB first time setup is done, please reuse the command.`);
            }
            const maintenanceTime = args[0] != null ? args[0] : `NA`;
            const maintenanceReason = args.slice(1).join(` `) != null ? args.slice(1).join(` `) : `NA`;
            if (row[0].maintenanceMode === `false`) {
                con.query(`UPDATE botSettings SET maintenanceMode="true", maintenanceETA="${maintenanceTime}", maintenanceReason="${maintenanceReason}"`);
                mainFuncs.send(message, "Bots maintenance mode have been turned on (Commands used from non server staff will be ignored)");
            } else {
                con.query(`UPDATE botSettings SET maintenanceMode="false"`);
                mainFuncs.send(message, "Bots maintenance mode have been turned off (Anyone can use commands again)");
            }
        });
    }
};