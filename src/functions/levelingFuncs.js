const { createCanvas, loadImage } = require('canvas');
const { applyText } = require("./canvasFuncs");

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    sendProfile: async (message, whoto, row2, lb, row, interaction) => {
        const level = row2.length == 0 ? 0 : row2.userLevel;
        const xp = row2.length == 0 ? 0 : row2.userXP;
        const requiredXP = row2.length == 0 && row.length == 0 ? level * 3 * 300 + 300 : level * 3 * row.xpNeeded + row.xpNeeded;
        const getFont = row2.font === 'default' ? 'Arial' : row2.font;
        const getFontStyle = row2.fontStyle === 'default' ? 'normal' : row2.fontStyle;
        const user = whoto.user.avatarURL().replace('.gif', '.png').replace('.webp', '.png');
        const convertImage = await loadImage(user);
        const data = await loadImage(`./src/assets/images/backgrounds/${row2.background}.png`);

        /*if (row.badges === 'enabled') {
            const canvas = createCanvas(700, 300);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0, 700, 300);

            ctx.beginPath();
            ctx.globalAlpha = 0.5;
            ctx.rect(15, 15, 668, 272);
            ctx.stroke();
            ctx.fillStyle = '#212121';
            ctx.fill();
            ctx.closePath();

            ctx.globalAlpha = 1;

            // Load badges
            const badges = row2.userBadges.split(',');
            let badgePosition = 575;
            for (const badge of badges) {
                if (badge === 'none') return;
                const badgeImage = await loadImage(`./src/assets/images/badges/${badge.replace(" ", "")}.png`);
                ctx.drawImage(badgeImage, badgePosition, 30, 55, 55);
                badgePosition -= 60;
            }

            ctx.font = applyText(canvas, `${message.author.username}!`, 50, getFontStyle, getFont);
            ctx.fillStyle = `${row2.textColor}`;
            ctx.fillText(`${message.author.username}`, 250, 135);

            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.moveTo(250, 95);
            ctx.lineTo(650, 95);
            ctx.stroke();

            ctx.font = applyText(canvas, `${message.author.username}!`, 46, getFontStyle, getFont);
            ctx.fillText(`#${lb.userId.indexOf(`${message.author.id}`) + 1}`, 580, 135);
            if (row2 && row2?.serverCash === 'yes') {
                ctx.font = `${getFontStyle} 500 26px ${getFont}`;
                const networth = row2.length == 0 ? '$0' : `$${numberWithCommas(parseInt(row2.userBank + row2.userPurse).toFixed(0))}`;
                ctx.fillText(`Level: ${level}`, 265, 125);
                ctx.fillText(`Networth: ${networth}`, 265, 150);
            } else {
                ctx.font = `${getFontStyle} 500 40px ${getFont}`;
                ctx.fillText(`${level}`, 115, 228);
            }

            ctx.font = applyText(canvas, `${message.author.username}!`, 34, getFontStyle, getFont);
            ctx.textAlign = 'center';
            ctx.fillText(`${numberWithCommas(xp)}/${numberWithCommas(requiredXP)}`, 560, 228);

            ctx.beginPath();
            ctx.lineJoin = "round";
            ctx.lineWidth = 23;
            ctx.rect(250, 250, 389, 3);
            ctx.stroke();
            ctx.lineJoin = "round";
            ctx.lineWidth = 14;
            ctx.strokeStyle = `${row2.textColor}`;
            ctx.strokeRect(250, 250, 389 * (xp / requiredXP), 3);
            ctx.closePath();

            //ctx.lineJoin = "round";
            //ctx.lineWidth = "45";
            //ctx.strokeStyle = "green";
            //ctx.strokeRect(250, 200, 389, 25);

            ctx.beginPath();
            ctx.arc(130, 105, 75, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(convertImage, 55, 30, 160, 160);

            const attachment = canvas.toBuffer();
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'profile.png'
                }]
            });

        } else {*/
        const canvas = createCanvas(700, 300);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0, 700, 250);

        ctx.beginPath();
        ctx.globalAlpha = 0.5;
        ctx.rect(15, 15, 667, 222);
        ctx.stroke();
        ctx.fillStyle = `${row2.bckgColor}`;
        ctx.fill();
        ctx.closePath();

        ctx.globalAlpha = 1;
        ctx.font = applyText(canvas, `${whoto.user.username}!`, 50, getFontStyle, getFont);
        ctx.fillStyle = `${row2.textColor}`;
        ctx.fillText(`${whoto.user.username}`, 250, 80);

        //ctx.beginPath();
        //ctx.lineWidth = 4;
        //ctx.moveTo(250, 90);
        //ctx.lineTo(525, 90);
        //ctx.stroke();

        ctx.font = applyText(canvas, `${whoto.user.username}!`, 46, getFontStyle, getFont);

        let n = 0;
        for (const row of lb) {
            n++;
            if (row.userId == whoto.user.id) {
                ctx.fillText(`#${n}`, 580, 80);
            }
        }

        if (row2 && row2?.serverCash === 'yes') {
            ctx.font = `${getFontStyle} 500 26px ${getFont}`;
            const networth = row2.length == 0 ? '$0' : `$${numberWithCommas(parseInt(row2.userBank + row2.userPurse).toFixed(0))}`;
            ctx.fillText(`Level: ${level}`, 265, 125);
            ctx.fillText(`Networth: ${networth}`, 265, 150);
        } else {
            ctx.font = `${getFontStyle} 500 29px ${getFont}`;
            ctx.fillText(`Level: ${level}`, 255, 188);
        }

        ctx.font = applyText(canvas, `${whoto.user.username}!`, 34, getFontStyle, getFont);
        ctx.textAlign = 'center';
        ctx.fillText(`${numberWithCommas(xp)}/${numberWithCommas(requiredXP)}`, 560, 188);

        ctx.beginPath();
        ctx.lineJoin = "round";
        ctx.lineWidth = 23;
        ctx.rect(250, 210, 389, 3);
        ctx.stroke();
        ctx.lineJoin = "round";
        ctx.lineWidth = 14;
        ctx.strokeStyle = `${row2.textColor}`;
        ctx.strokeRect(250, 210, 389 * (xp / requiredXP), 3);
        ctx.closePath();

        //ctx.lineJoin = "round";
        //ctx.lineWidth = "45";
        //ctx.strokeStyle = "green";
        //ctx.strokeRect(250, 200, 389, 25);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(convertImage, 25, 25, 200, 200);

        const attachment = canvas.toBuffer();
        if (interaction != undefined && interaction.isRepliable()) {
            return interaction.reply({
                files: [{
                    attachment,
                    name: 'profile.png'
                }]
            });
        } else {
            return message.channel.send({
                files: [{
                    attachment,
                    name: 'profile.png'
                }]
            });
        }
    }
};