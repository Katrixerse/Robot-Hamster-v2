const { Client, Collection, GatewayIntentBits, Partials, Options, WebhookClient, EmbedBuilder } = require('discord.js');
const { botToken } = require('./config.json');
const handleEvents = require("./src/handlers/handleEvents");
const handleCommands = require('./src/handlers/handleCommands');
const handleSlashcommands = require('./src/handlers/handleSlashcmds');

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildWebhooks],
    partials: [Partials.Channel, Partials.GuildMember, Partials.User, Partials.Reaction, Partials.Message],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    makeCache: Options.cacheWithLimits({ ...Options.defaultMakeCacheSettings })
});

['slashCommands', 'commands', 'aliases', 'description', 'usage', 'cooldownTime', 'group', 'botPermissions'].forEach(x => bot[x] = new Collection());

handleEvents(bot);
handleCommands(bot);
handleSlashcommands(bot);

//bot.on('debug', console.log);

// Webhooks
//const errorLogs = new WebhookClient({
//    id: "1065258865404428298",
//    token: "MLEvvzzADx5oBYGf34KT7DPkpPal37CU4zA1PHPlu34zBNmAMMvbRARgdPniAYmdHP73",
//});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
    if (error.message === 'Unknown Message') return;
    if (error) if (error.length > 950) error = error.slice(0, 950) + '... view console for details';
    if (error.stack) if (error.stack.length > 950) error.stack = error.stack.slice(0, 950) + '... view console for details';
    if(!error.stack) return;
    const embed = new EmbedBuilder()
        .setTitle(`🚨・Unhandled promise rejection`)
        .addFields([
            {
                name: "Error",
                value: error ? `\`\`\`${error}\`\`\`` : "No error",
            },
            {
                name: "Stack error",
                value: error.stack ? `\`\`\`${error.stack}\`\`\`` : "No stack error",
            }
        ])
        .setColor(0xFF0000);
    errorLogs.send({
        username: 'Not a hamster',
        embeds: [embed],
    }).catch(() => {
        console.log('Error sending unhandledRejection to webhook');
        console.log(error);
    });
})

bot.on('shardError', error => {
    console.log(error);
    if (error) if (error.length > 950) error = error.slice(0, 950) + '... view console for details';
    if (error.stack) if (error.stack.length > 950) error.stack = error.stack.slice(0, 950) + '... view console for details';
    if (!error.stack) return;
    const embed = new EmbedBuilder()
        .setTitle(`🚨・A websocket connection encountered an error`)
        .addFields([
            { name: `Error`, value: `\`\`\`${error}\`\`\``, },
            { name: `Stack error`, value: `\`\`\`${error.stack}\`\`\``, }
        ])
        .setColor(0xFF0000);
    errorLogs.send({
        username: 'Not a hamster',
        embeds: [embed],
    });
});

bot.login(botToken);