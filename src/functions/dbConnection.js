const mysql = require('mysql2');
const { dbPassword } = require("../../config.json")

const createPool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'kat',
    password: dbPassword,
    database: 'discord_bot_db',
    charset: 'utf8mb4_unicode_ci',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
});

const connPool = mysql.createPool(config);

// Improved connection check and error handling
connPool.getConnection((err, connection) => {
    if (err) {
        console.error('Error getting MySQL pool connection:', err);
    } else {
        console.log('Connected to Database');
        connection.release();
    }
});

module.exports = { con: connPool };