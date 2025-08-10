const mysql = require('mysql2');

const createPool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'kat',
    password: '75E$FSvJa2u',
    database: 'discord_bot_db',
    charset: 'utf8mb4_unicode_ci',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
});

module.exports = {
    executeQuery: async (query) => {
        let connection;

        try {
            connection = await createPool.getConnection();
            console.log(connection);
        } catch (error) {
            console.error('Error executing query:', error);
        } finally {
            if (connection) connection.release();
        }
    }
}