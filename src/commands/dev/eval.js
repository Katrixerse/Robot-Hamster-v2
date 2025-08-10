const { EmbedBuilder } = require("discord.js");
const util = require('util');
const mainFuncs = require("../../functions/mainFuncs");

module.exports = {
  name: 'eval',
  aliases: ["eval"],
  description: 'For the bot devs',
  usage: 'eval message.channel.send(\'Hi\')',
  cooldownTime: '1', // lol
  group: 'dev',
  botPermissions: ['none'],
  run: async (bot, prefix, message, args, con) => {
    console.log("eval command ran");
    if (message.author.id !== "130515926117253122" && message.author.id !== "307472480627326987") return message.channel.send("Only the bot developers can use this command.");
    const code = args.join(" ");
    if (!code) return message.channel.send(`I can't eval nothing silly dev.`);
    if (code.toLowerCase().includes("bot.token") || code.toLowerCase().includes("process") || code.toLowerCase().includes("bot.commands")) return message.channel.send(`That is Forbidden, ${message.author.username}.`);
    try {
      let evaled = eval(code);
      if (typeof evaled !== "string") evaled = util.inspect(evaled);
      const checkCharLength = clean(evaled);
      if (code.length > 1023) {
        if (message.channel.id != "831179886612840449") return mainFuncs.send(message, "Evaled out of dev channel can\'t send text file, please look at the console for the error.");
        return message.channel.send({ content: 'Output exceeded 1024 characters. Sending as a file.', files: [{ attachment: Buffer.from(checkCharLength), name: 'output.txt' }] });
      }
      if (code === clean(evaled)) return message.channel.send('The input was the same as the output.');
      const embed = new EmbedBuilder()
        .setColor(`#F49A32`)
        .addFields([
          { name: "**__Input:__**", value: `\`\`\`${code}\`\`\`` },
          { name: "**__Output:__**", value: `\`\`\`js\n${clean(evaled)}\n\`\`\`` }
        ]);
      message.channel.send({ embeds: [embed] });
    } catch (err) {
      if (err.message.length > 1023) {
        if (message.channel.id != "831179886612840449") return mainFuncs.send(message, "Evaled out of dev channel can\'t send text file, please look at the console for the error.");
        return message.channel.send({ content: 'Error exceeded 1024 characters. Sending as a file.', files: [{ attachment: Buffer.from(clean(err.message)), name: 'error.txt' }] });
      }
      const embed = new EmbedBuilder()
        .setColor(`#F49A32`)
        .addFields([
          { name: "**__Input:__**", value: `\`\`\`${code}\`\`\`` },
          { name: "**__Output:__**", value: `\`\`\`js\n${clean(err.message)}\n\`\`\`` }
        ]);
      message.channel.send({ embeds: [embed] });
    }

    function clean(text) {
      if (typeof (text) === 'string') {
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
      } else {
        return text;
      }
    }
  }
};