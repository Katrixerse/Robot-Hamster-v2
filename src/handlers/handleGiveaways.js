const { PermissionFlagsBits } = require("discord.js");

class Giveaway {
    constructor(rows, embed = undefined, message, bot, con) {
        // INITIALIZATION
        this.prize = rows.prize;
        this.winners = rows.winners;
        this.id = rows.gid;
        this.mid = rows.mid;
        this.em = embed;
        this.message = message;
        this.bot = bot;
        this.con = con;
        this.rows = rows;
        this.channel = rows.channel;
        this.startedby = rows.startedby;
    }

    getRand(winners, ru) {
        const winnersarr = [];
        for (let i = 0; i < winners; i += 1) {
            let chosen = ru.random();
            while (winnersarr.includes(chosen)) {
                chosen = ru.random();
            }
            winnersarr.push(chosen);
        }
        return winnersarr;
    }

    makeEm(title, desc, f = false, ft = "", h = false, z = false) {
        const { EmbedBuilder } = require("discord.js");
        const newEm = new EmbedBuilder()
            .setColor(`#F49A32`)
            .setTimestamp()
            .setAuthor({
                name: this.bot.user.username
            })
            .setThumbnail(this.message.author.avatarURL({
                dynamic: true
            }))
            .setTitle(title)
            .setDescription(desc);
        if (h) {
            newEm.addFields([
                { name: 'Hosted by', value: `<@${this.startedby}>`, inline: false }
            ]);
        }
        if (z) {
            newEm.addFields([
                { name: 'Role(s) Required', value: `${this.rows.role != null ? this.rows.role.slice(0, -2) : "none"}`, inline: false }
            ]);
        }
        if (f) {
            newEm.setFooter({
                text: ft
            });
        }
        return newEm;
    }

    async end(res = false) {
        // FETCHING MESSAGE & USERS
        const mid = this.mid;
        const giveAwayChannel = this.message.guild.channels.cache.find(channel => channel.id == this.channel);
        if (!this.message.guild.members.me.permissionsIn(giveAwayChannel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory])) return;
        const mes = await giveAwayChannel.messages.fetch(mid);
        if (!mes) return this.mainFuncs.send(this.message, `Giveaway with prize: *${this.prize}* was not found in this channel. The embed may have been deleted or the bot restarted.`);
        if (mes.embeds[0].title.includes("Ended")) return;
        const reaction = mes.reactions.cache.get("🎉");
        const reactionUsers = await reaction.users.fetch();

        let giveawayRolesCheck;

        const tempUsers = new Set();

        /*if (res) {
            const users = this.rows.users;
            const usersarr = users.split(",");
            usersarr.forEach(u=>{
              if(u=="")return;
              reactionUsers.set(u, this.message.guild.members.cache.get(u).user);
            });
        }*/

        // REMOVE BOTS & AUTHOR
        reactionUsers.delete(this.rows.startedby);
        reactionUsers.forEach(u => {
            if (u.bot) reactionUsers.delete(u.id);
        });
        if (this.rows.role != null && this.rows.role != "none") {
            if (this.rows.role.includes(`, `)) {
                reactionUsers.forEach(u => {
                    const guildMember = this.message.guild.members.cache.get(u.id);
                    const roleArr = this.rows.role.split(`, `);
                    roleArr.forEach(gRole => {
                        console.log(gRole);
                        //if (gRole === "" || gRole === " ") return;
                        //const fixGRole = gRole.replace(`<`, ``).replace(`@`, ``).replace(`&`, ``).replace(`>`, ``);
                        //console.log(fixGRole);
                        const giveawayRole = this.message.guild.roles.cache.find(role => role.id === gRole);
                        if (!giveawayRole) {
                            return giveawayRolesCheck = `invalidRole`;
                        } else {
                            if (guildMember.roles.cache.has(giveawayRole.id) && tempUsers.has(u.id) == false) {
                                return tempUsers.add(u.id);
                            } else if (guildMember.roles.cache.has(giveawayRole.id) == false && tempUsers.has(u.id) == false) {
                                return reactionUsers.delete(u.id);
                            } else {
                                return;
                            }
                        }
                    });
                });
                if (giveawayRolesCheck === `invalidRole`) {
                    const em2 = this.makeEm(`Giveaway Ended`, "Nobody won, couldn't find the required role anymore!");
                    if (mes.editable) mes.edit({ embeds: [em2] });
                    tempUsers.clear();
                    return this.con.promise().query(`DELETE FROM giveaways WHERE guildId="${this.message.guild.id}" AND gid="${this.id}"`);
                }
            } else {
                const requiredRole = mes.guild.roles.cache.find(role => role.id === this.rows.role);
                if (!requiredRole) {
                    const em2 = this.makeEm(`Giveaway Ended`, "Nobody won, couldn't find the required role anymore!");
                    if (mes.editable) mes.edit({ embeds: [em2] });
                    return this.con.promise().query(`DELETE FROM giveaways WHERE guildId="${this.message.guild.id}" AND gid="${this.id}"`);
                }

                reactionUsers.forEach(u => {
                    const guildMember = mes.guild.members.cache.get(u.id);
                    if (!guildMember.roles.cache.has(requiredRole.id)) return reactionUsers.delete(u.id);
                });
            }
        }

        // IF NOBODY EXCEPT THE BOT AND THE AUTHOR REACTED, END THE GIVEAWAY
        if (reactionUsers.size == 0) {
            const em = this.makeEm(`Giveaway Ended`, "Nobody won, not enough users reacted");
            if (mes.editable) mes.edit({ embeds: [em] });
            return this.con.promise().query(`DELETE FROM giveaways WHERE guildId="${this.message.guild.id}" AND gid="${this.id}"`);
        } else {
            // GET RANDOM USER(S) FROM THE COLLECTION
            let howmanywinners = this.winners;
            if (howmanywinners > reactionUsers.size) howmanywinners = reactionUsers.size;
            const picked = this.getRand(howmanywinners, reactionUsers);

            // SEND THE EMBED WITH THE USERS THAT WON
            const em = this.makeEm(`Giveaway Ended!`, `Congratulations ${picked.map(u => u)}, you won the **${this.prize}**`, true, `${howmanywinners} winner(s)`, true, true);
            if (mes.editable) mes.edit({ embeds: [em] });
            mes.channel.send(`Congratulations ${picked.map(u => u)}, you won the **${this.prize}** from <@${this.startedby}>`);

            // DELETE THE GIVEAWAY FROM THE DB
            return this.con.promise().query(`DELETE FROM giveaways WHERE guildId="${this.message.guild.id}" AND gid="${this.id}"`);
        }
    }
}

module.exports.giveaway = Giveaway;