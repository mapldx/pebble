const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '192.168.1.133',
    user: 'zak',
    password: 'maple123',
    database: 'pebble'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database successfully!');
});

module.exports = db;