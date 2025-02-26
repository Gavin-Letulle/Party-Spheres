const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASS, 
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL Connection Error:', err);
        return;
    }
    console.log('✅ MySQL connected successfully!');
    connection.release(); // Release the connection back to the pool
});

module.exports = pool.promise();