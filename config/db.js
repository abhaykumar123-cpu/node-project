// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',          // replace with your MySQL username
  password: '',          // replace with your MySQL password
  database: 'node_crud'  // make sure this DB exists
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

module.exports = db;
