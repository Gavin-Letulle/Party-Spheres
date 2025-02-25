const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root', //We will probably want to change root to something else, not sure how that works
    password: 'gavsql156', //Change password to your mysql password (might be your actual computer login password, not sure how to make this global yet)
    database: 'partyspheres', //Make sure this is the same name as the database
});

connection.connect((err => {
    if(err) throw err;
    console.log('MySQL connected successfully!');
}));

module.exports = connection;