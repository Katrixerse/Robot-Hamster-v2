const { EmbedBuilder } = require("discord.js");
const util = require('util');
const { exec } = require('child_process');
module.exports = {
    name: 'exec',
    aliases: ["exec"],
    description: 'For the bot devs',
    usage: 'exec htop',
    cooldownTime: '1',
    group: 'dev',
    botPermissions: ['none'],
    run: async (bot, prefix, message, args, con) => {
        if (message.author.id !== "130515926117253122") return message.channel.send("Only the bot developers can use this command.");
        const code = args.join(' ');
        if (!code) return message.channel.send('You provided no input silly dev.');
        exec(code, (error, stdout, stderr) => {
            const input = `\`\`\`Bash\n${code}\n\`\`\``;
            if (error) {
                const output = `\`\`\`Bash\n${error}\n\`\`\``;
                message.channel.send({ content: output });
            } else {
                const output = stderr || stdout;
                const output2 = `\`\`\`Bash\n${output}\n\`\`\``;
                message.channel.send({ content: output2 });
            }
        });
    }
};