const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '172.234.16.153',
    user: 'zsy',
    password: 'Hn*!A8u',
    database: 'appdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function keepAlive() {
    pool.query('SELECT 1', [], (err, results) => {
        if (err) {
            console.error('Error while keeping the database connection alive:', err.message);
        }
    });
}

setInterval(keepAlive, 1000 * 60 * 60);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database successfully!');
    connection.release();
});

module.exports = pool;
