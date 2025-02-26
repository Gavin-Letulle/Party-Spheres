require('dotenv').config();
console.log("🔍 Loaded ENV Variables:", process.env.DB_HOST, process.env.DB_USER);

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASS, 
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL Connection Error:', err.code, err.message);
        return;
    }
    console.log('✅ MySQL connected successfully!');
    connection.release();
});

// Explicitly test a query
pool.query('SELECT NOW() AS time', (err, rows) => {
    if (err) {
        console.error('❌ Database Query Failed:', err.message);
    } else {
        console.log('✅ Query Test Successful:', rows);
    }
});

module.exports = pool.promise();