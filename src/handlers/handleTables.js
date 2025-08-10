const { executeQuery } = require('../functions/dbConnection.js');

/**
 * Database table handler: creates core tables and provides per-guild bootstrap/cleanup.
 * Note: Uses parameterized queries where values are dynamic.
 */
const createTables = () => {
    // Bot/global tables
    executeQuery(
        'CREATE TABLE IF NOT EXISTS botSettings (maintenanceMode TEXT(30), maintenanceETA TEXT(30), maintenanceReason TEXT(255), commandCount INTEGER(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS blacklist (user TEXT(30), reason TEXT(255))');

    // Moderation/config tables
    executeQuery('CREATE TABLE IF NOT EXISTS serverPrefix (guildId TEXT(30), prefix TEXT(30))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverSettings (guildId TEXT(30), modlogs TEXT(30), chatlogs TEXT(30), modlogsChannel TEXT(30), chatlogsChannel TEXT(30), rolePersist TEXT(30), serverLevels TEXT(30), ServerCash TEXT(30), modOnlyCommands TEXT(30), disabledEvents TEXT(255), serverStats TEXT(30), serverCaptcha TEXT(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS casenumber (guildId TEXT(30), cn INTEGER(30), m_id TEXT(30))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS warnings (guildId TEXT(30), userId TEXT(30), warn_reason TEXT(30), warn_date TEXT(30), warned_by TEXT(30))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverAutomod (guildId TEXT(30), anticaps TEXT(30), anticapslim INTEGER(20), antiinv TEXT(30), warn TEXT(30), antiascii TEXT(30), antilinks TEXT(30), warnoutput TEXT(30), antimm TEXT(30), antimmlim INTEGER(30), antispam TEXT(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS serverAutoroles (guildId TEXT(30), enabled TEXT(20), roles TEXT(255))');
    // Include style/background to match inserts
    executeQuery(
        'CREATE TABLE IF NOT EXISTS guildWl (guildId TEXT(30), welcomeMessageEnabled TEXT(30), welcomeMessage TEXT(255), welcomeChannel TEXT(30), leaveMessageEnabled TEXT(30), leaveMessage TEXT(255), leaveChannel TEXT(30), style TEXT(30), background TEXT(30))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS giveaways (guildId TEXT(30), gid TEXT(30), time INTEGER(50), prize TEXT(30), winners INTEGER(50), is_active TEXT(30), mid TEXT(30), started_at TEXT(30), channel TEXT(30), sponseredBy TEXT(30), startedby TEXT(30), role TEXT(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS serverRep (guildId TEXT(30), userId TEXT(30), reason TEXT(50), reppedBy TEXT(50))');
    executeQuery('CREATE TABLE IF NOT EXISTS serverTotalRep (guildId TEXT(30), userId TEXT(30), rep INTEGER(30))');
    executeQuery('CREATE TABLE IF NOT EXISTS serverRolepersist (guildId TEXT(30), userId TEXT(30), role TEXT(255))');
    executeQuery('CREATE TABLE IF NOT EXISTS serverTicketSettings (guildId TEXT(30), ticketsEnabled TEXT(30), messageId TEXT(30))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverReactionRoles (guildId TEXT(30), emojiName TEXT(30), channelId TEXT(30), messageId TEXT(30), roleName TEXT(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS serverTfa (guildId TEXT(30), enabled TEXT(30), code TEXT(50))');
    executeQuery('CREATE TABLE IF NOT EXISTS serverCustomCommands (guildId TEXT(30), name TEXT(30), output TEXT(255))');
    executeQuery('CREATE TABLE IF NOT EXISTS serverStaff (guildId TEXT(30), userId TEXT(30), userRank TEXT(30))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverCategories (guildId TEXT(30), economy TEXT(30), fun TEXT(30), info TEXT(30), leveling TEXT(30), moderation TEXT(30), nsfw TEXT(30), roleplay TEXT(30), misc TEXT(30), image TEXT(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS serverTickets (guildId TEXT(30), roles TEXT(255), ticketNumber INTEGER(30))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverAutoban (guildId TEXT(30), days TEXT(30), day TEXT(30), dates TEXT(30), date TEXT(50), strings TEXT(30), string TEXT(70), invites TEXT(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS userGuilds (userId TEXT(30), guilds TEXT(255))');
    executeQuery('CREATE TABLE IF NOT EXISTS userPrefGuilds (userId TEXT(30), guild TEXT(255))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverTicketOpts (guildId TEXT(30), content TEXT(255), field_name TEXT(80), field_val TEXT(80))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverResponses (guildId TEXT(30), banMessage TEXT(125), unbanMessage TEXT(125), kickMessage TEXT(125), warnMessage TEXT(125), muteMessage TEXT(125), unmuteMessage TEXT(125))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverTicketReaction (guildId TEXT(30), cid TEXT(50), mid TEXT(50), content TEXT(255), field_name TEXT(125), field_val TEXT(125))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverOpenedTickets (guildId TEXT(30), userId TEXT(30), channeld TEXT(30), openedDate TEXT(30))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverStickyMessages (guildId TEXT(30), channelId TEXT(30), messageContent TEXT(255), isEmbeded TEXT(30), messagesBeforeSticky INTEGER(30), lastStickyMessage TEXT(30))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS serverTimedRoles (guildId TEXT(30), userId TEXT(30), role TEXT(30), timeLeft INTEGER(30))');

    // Twitch/Reddit
    executeQuery('CREATE TABLE IF NOT EXISTS streams (userId TEXT(255))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverTwitch (guildId TEXT(50), username TEXT(50), channel TEXT(50), receivingAlerts TEXT(50), messageContent TEXT(255))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverReddit (guildId TEXT(50), recieveFeed TEXT(30), subReddit TEXT(50), feedChannel TEXT(30), lastPost TEXT(50))'
    );

    // Leveling/economy
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverLevels (guildId TEXT(30), userId TEXT(30), userLevel INTEGER(50), userXP INTEGER(255), userBadges TEXT(255))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS profileSettings (guildId TEXT(30), userId TEXT(30), textColor TEXT(30), background TEXT(30), font TEXT(30), fontStyle TEXT(30), bckgColor TEXT(30))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverLevelSettings (guildId TEXT(30), minAmount INTEGER(50), maxAmount INTEGER(50), xpNeeded INTEGER(50), maxLevel INTEGER(50), levelUpMessages TEXT(30), badges TEXT(30), blockedChannels TEXT(255))'
    );
    executeQuery('CREATE TABLE IF NOT EXISTS serverLevelRewards (guildId TEXT(30), levelRequired INTEGER(50), role TEXT(255))');
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverCash (guildId TEXT(30), userId TEXT(30), userPurse INTEGER(50), userBank INTEGER(50), userGems INTEGER(50), dailyLastClaimed TEXT(30), dailyStreak INTEGER(30))'
    );
    executeQuery(
        'CREATE TABLE IF NOT EXISTS serverCashSettings (guildId TEXT(30), currencyType TEXT(30), minAmount INTEGER(50), maxAmount INTEGER(50), blockedChannels TEXT(255), allowBoosters TEXT(30), disableRobbing TEXT(30))'
    );

    // Dashboard/commands
    executeQuery(
        'CREATE TABLE IF NOT EXISTS botCommands (commandName TEXT(30), commandAliases TEXT(30), commandDescription TEXT(255), commandUsage TEXT(30), commandGroup TEXT(30), botPermissions TEXT(30))'
    );

    // Missing table used by addGuild
    executeQuery(
        'CREATE TABLE IF NOT EXISTS verifySettings (guildId TEXT(30), verifyMessage TEXT(255), canUnverify TEXT(10), verifyRole TEXT(50), otherRoles TEXT(255), autoVerify TEXT(10))'
    );

    console.log('Setup tables check completed.');
};

const addGuild = (gname, gid) => {
    executeQuery('SELECT * FROM serverPrefix WHERE guildId = ?', [gid], (e, rows) => {
        if (e) return console.log(e.message);
        if (!rows || rows.length === 0) {
            executeQuery('INSERT INTO serverPrefix (guildId, prefix) VALUES (?, ?)', [gid, 'r!']);
            executeQuery(
                'INSERT INTO serverSettings (guildId, modlogs, chatlogs, modlogsChannel, chatlogsChannel, rolePersist, serverLevels, ServerCash, modOnlyCommands, disabledEvents, serverStats, serverCaptcha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [gid, 'off', 'off', 'modlogs', 'chatlogs', 'no', 'no', 'no', 'no', 'none', 'disabled', 'disabled']
            );
            executeQuery(
                'INSERT INTO serverCategories (guildId, economy, fun, info, leveling, moderation, nsfw, roleplay, misc, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [gid, 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes']
            );
            executeQuery('INSERT INTO casenumber (guildId, cn) VALUES (?, ?)', [gid, 0]);
            executeQuery(
                'INSERT INTO serverAutomod (guildId, anticaps, anticapslim, antiinv, warn, antiascii, antilinks, warnoutput, antimm, antimmlim, antispam) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [gid, 'no', 1, 'no', 'no', 'no', 'no', 'channel', 'no', 5, 'no']
            );
            executeQuery('INSERT INTO serverAutoroles (guildId, enabled, roles) VALUES (?, ?, ?)', [gid, 'no', '']);
            // Include code value to satisfy serverTfa schema
            executeQuery('INSERT INTO serverTfa (guildId, enabled, code) VALUES (?, ?, ?)', [gid, 'false', 'none']);
            executeQuery(
                'INSERT INTO guildWl (guildId, welcomeMessageEnabled, welcomeMessage, welcomeChannel, leaveMessageEnabled, leaveMessage, leaveChannel, style, background) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    gid,
                    'false',
                    'Hello %NAME%. Welcome to %GUILDNAME%.',
                    'welcome-leaves',
                    'false',
                    'Goodbye %NAME%. %NAME% left the guild.',
                    'welcome-leaves',
                    'image',
                    'default',
                ]
            );
            executeQuery(
                'INSERT INTO serverLevelSettings (guildId, minAmount, maxAmount, xpNeeded, maxLevel, levelUpMessages, badges, blockedChannels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [gid, 50, 100, 300, 100, 'yes', 'disabled', 'none']
            );
            executeQuery(
                'INSERT INTO verifySettings (guildId, verifyMessage, canUnverify, verifyRole, otherRoles, autoVerify) VALUES (?, ?, ?, ?, ?, ?)',
                [gid, '%MCNAME%, thanks for linking your account.', 'yes', 'Verified', 'none', 'yes']
            );
            executeQuery(
                'INSERT INTO serverAutoban (guildId, days, day, dates, date, strings, string, invites) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [gid, 'disabled', 'not set', 'disabled', 'not set', 'disabled', 'not set', 'disabled']
            );
            executeQuery(
                'INSERT INTO serverTwitch (guildId, username, channel, receivingAlerts, messageContent) VALUES (?, ?, ?, ?, ?)',
                [gid, 'not set', 'not set', 'no', 'none']
            );
            executeQuery(
                'INSERT INTO serverReddit (guildId, recieveFeed, subReddit, feedChannel, lastPost) VALUES (?, ?, ?, ?, ?)',
                [gid, 'off', 'none', 'none', 'none']
            );
            executeQuery(
                'INSERT INTO serverResponses (guildId, banMessage, unbanMessage, kickMessage, warnMessage, muteMessage, unmuteMessage) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    gid,
                    '%USER% has been banned.',
                    '%USER% has been unbanned.',
                    '%USER% has been kicked.',
                    '%USER% has been warned.',
                    '%USER% has been muted.',
                    '%USER% has been unmuted.',
                ]
            );
            console.log(`Added guild with name: ${gname} ID: ${gid} to the DB.`);
        }
    });
};

const removeGuild = (gname, gid) => {
    executeQuery('SELECT 1 FROM serverSettings WHERE guildId = ? LIMIT 1', [gid], (e, rows) => {
        if (e) return console.log(e.message);
        if (rows && rows.length >= 1) {
            const tables = [
                'serverPrefix',
                'serverSettings',
                'casenumber',
                'warnings',
                'serverAutomod',
                'serverAutoroles',
                'guildWl',
                'giveaways',
                'serverRep',
                'serverTotalRep',
                'serverRolepersist',
                'serverTicketSettings',
                'serverReactionRoles',
                'serverTfa',
                'serverCustomCommands',
                'serverStaff',
                'serverCategories',
                'serverTickets',
                'serverAutoban',
                'serverTicketOpts',
                'serverResponses',
                'serverTicketReaction',
                'serverOpenedTickets',
                'serverTwitch',
                'serverLevels',
                'serverLevelSettings',
                'serverLevelRewards',
                'serverCash',
                'serverCashSettings',
                'serverStickyMessages',
                'serverTimedRoles',
                'serverReddit',
                'profileSettings',
            ];

            tables.forEach((t) => {
                executeQuery(`DELETE FROM ${t} WHERE guildId = ?`, [gid]);
            });
            console.log(`Removed guild with name: ${gname} ID: ${gid} from the DB.`);
        }
    });
};

module.exports = { createTables, addGuild, removeGuild };