const mainFuncs = require('../../functions/mainFuncs.js');
const { shuffle, verify } = require('../../functions/economyFuncs.js');
const suits = ['♣', '♥', '♦', '♠'];
const faces = ['Jack', 'Queen', 'King'];
const games = new Map();
const deckCount = 3;

function generateDeck(deckCount) {
    const deck = [];
    for (let i = 0; i < deckCount; i++) {
        for (const suit of suits) {
            deck.push({
                value: 11,
                display: `${suit} Ace`
            });
            for (let j = 2; j <= 10; j++) {
                deck.push({
                    value: j,
                    display: `${suit} ${j}`
                });
            }
            for (const face of faces) {
                deck.push({
                    value: 10,
                    display: `${suit} ${face}`
                });
            }
        }
    }
    return shuffle(deck);
}

function draw(channel, hand) {
    const deck = games.get(channel.id).data;
    const card = deck[0];
    deck.shift();
    hand.push(card);
    return card;
}

function calculate(hand) {
    return hand.sort((a, b) => a.value - b.value).reduce((a, b) => {
        let {
            value
        } = b;
        if (value === 11 && a + value > 21) value = 1;
        return a + value;
    }, 0);
}

module.exports = {
    name: 'blackjack',
    aliases: ["blacljack"],
    description: 'Play a game of blackjack',
    usage: 'ping',
    cooldownTime: '1',
    group: 'economy',
    botPermissions: ['none'],
    run: (bot, prefix, message, args, con) => {
        con.query(`SELECT ss.ServerCash, scs.currencyType FROM serverSettings as ss LEFT JOIN serverCashSettings as scs ON scs.guildId = ss.guildId WHERE ss.guildId ="${message.guild.id}"`, (e, row) => {
            if (!row || row.length == 0 || row[0].ServerCash == "no") return message.channel.send(`Economy isn't enabled in this server, can ask the server owner to enable it with mngeconmy`);
        });
            con.query(`SELECT * FROM serverCash WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`, async (e, row2) => {
            if (!row2 || row2.length == 0 || row2[0].userPurse == 0) return mainFuncs.send(message, "You haven't earned any cash yet.");
            try {
                const userBet = parseInt(args.join(` `));
                const won = Math.round(userBet * 2);
                if (!userBet) return mainFuncs.send(message, "Please provide a number to gamble!");
                if (isNaN(userBet) || userBet <= 0) return mainFuncs.send(message, "Not a valid number.");
                if (!isFinite(userBet)) return mainFuncs.send(message, "Not a valid number.");
                if (userBet > row2[0].userPurse) return mainFuncs.send(message, "Cannot bet a number higher than your balance.");
                const current = games.get(message.channel.id);
                if (current) return message.reply(`Please wait until the current game of \`${current.name}\` is finished.`, false);
                games.set(message.channel.id, {
                    name: 'Blackjack',
                    data: generateDeck(deckCount)
                });
                const dealerHand = [];
                draw(message.channel, dealerHand);
                draw(message.channel, dealerHand);
                const playerHand = [];
                draw(message.channel, playerHand);
                draw(message.channel, playerHand);
                const dealerInitialTotal = calculate(dealerHand);
                const playerInitialTotal = calculate(playerHand);
                if (dealerInitialTotal === 21 && playerInitialTotal === 21) {
                    games.delete(message.channel.id);
                    return mainFuncs.send(message, "Well, both of you just hit blackjack. Right away. Rigged.");
                } else if (dealerInitialTotal === 21) {
                    games.delete(message.channel.id);
                    mainFuncs.send(message, "Ouch, the dealer hit blackjack right away! Try again!");
                    return con.promise().query(`UPDATE serverCash SET userPurse = ${row2[0].userPurse - userBet} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                } else if (playerInitialTotal === 21) {
                    games.delete(message.channel.id);
                    mainFuncs.send(message, "Wow, you hit blackjack right away! Lucky you!");
                    return con.promise().query(`UPDATE serverCash SET userPurse = ${row2[0].userPurse + won} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
                }
                let playerTurn = true;
                let win = false;
                let reason;
                while (!win) {
                    if (playerTurn) {
                        await message.channel.send(`**First Dealer Card:** ${dealerHand[0].display}\n**You (${calculate(playerHand)}):**\n${playerHand.map(card => card.display).join('\n')}\n_Hit (type yes or no)?_
                    `);
                        const hit = await verify(message.channel, message.author);
                        if (hit) {
                            const card = draw(message.channel, playerHand);
                            const total = calculate(playerHand);
                            if (total > 21) {
                                reason = `You drew ${card.display}, total of ${total}! Bust`;
                                break;
                            } else if (total === 21) {
                                reason = `You drew ${card.display} and hit 21`;
                                win = true;
                            }
                        } else {
                            const dealerTotal = calculate(dealerHand);
                            await mainFuncs.send(message, `Second dealer card is ${dealerHand[1].display}, total of ${dealerTotal}.`);
                            playerTurn = false;
                        }
                    } else {
                        const inital = calculate(dealerHand);
                        let card;
                        if (inital < 17) card = draw(message.channel, dealerHand);
                        const total = calculate(dealerHand);
                        if (total > 21) {
                            reason = `Dealer drew ${card.display}, total of ${total}! Dealer bust`;
                            win = true;
                        } else if (total >= 17) {
                            const playerTotal = calculate(playerHand);
                            if (total === playerTotal) {
                                reason = `${card ? `Dealer drew ${card.display}, making it ` : ''}${playerTotal}-${total}`;
                                break;
                            } else if (total > playerTotal) {
                                reason = `${card ? `Dealer drew ${card.display}, making it ` : ''}${playerTotal}-**${total}**`;
                                break;
                            } else {
                                reason = `${card ? `Dealer drew ${card.display}, making it ` : ''}**${playerTotal}**-${total}`;
                                win = true;
                            }
                        } else {
                            await mainFuncs.send(message, `Dealer drew ${card.display}, total of ${total}.`);
                        }
                    }
                }
                games.delete(message.channel.id);
                if (win) {
                message.channel.send(`${reason}! You won x2 your bet for a total of: ${won} ${row[0].currencyType}!`);
                return con.promise().query(`UPDATE serverCash SET userPurse = ${row2[0].userPurse + won} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
            } else {
                message.channel.send(`${reason}! Too bad you lost: ${userBet.toFixed(2)} ${row[0].currencyType}.`);
                return con.promise().query(`UPDATE serverCash SET userPurse = ${row2[0].userPurse - userBet} WHERE guildId = "${message.guild.id}" AND userId = "${message.author.id}"`);
            }
            } catch (err) {
                games.delete(message.channel.id);
                throw err;
            }
        });
    }
};