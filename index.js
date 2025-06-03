// const express = require('express');
// const bodyParser = require('body-parser');
// const db = require('./db');

// const app = express();
// app.use(bodyParser.json());
// const port = 3000;

// // CREATE
// app.post('/users', (req, res) => {
//   const { name, email, phone_no, age } = req.body;

//   if (!name || !email || !phone_no || !age) {
//     return res.status(400).json({ error: 'Name, email, phone number, and age are required' });
//   }

//   const sql = 'INSERT INTO users (name, email, phone_no, age) VALUES (?, ?, ?, ?)';
//   db.query(sql, [name, email, phone_no, age], (err, result) => {
//     if (err) {
//       console.error('❌ Error inserting user:', err);
//       return res.status(500).json({ error: 'Database error' });
//     }
//     res.status(201).json({ message: 'User added', userId: result.insertId });
//   });
// });


// // READ ALL
// app.get('/users', (req, res) => {
//   db.query('SELECT * FROM users', (err, results) => {
//     if (err) throw err;
//     res.json(results);
//   });
// });

// // READ ONE
// app.get('/users/:id', (req, res) => {
//   db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, result) => {
//     if (err) throw err;
//     res.json(result[0]);
//   });
// });

// // UPDATE
// app.put('/users/:id', (req, res) => {
//   const { name, email } = req.body;
//   db.query('UPDATE users SET name = ?, email = ? phone_no = ?, age = ? WHERE id = ?', [name, email, req.params.id], (err, result) => {
//     if (err) throw err;
//     res.send('User updated successfully');
//   });
// });

// // DELETE
// app.delete('/users/:id', (req, res) => {
//   db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
//     if (err) throw err;
//     res.send('User deleted successfully');
//   });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3000;

app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public')); // serve static files like index.html

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CREATE
app.post('/users', (req, res) => {
  const { name, email, phone_no, age } = req.body;
  if (!name || !email || !phone_no || !age) {
    return res.send('All fields are required');
  }

  const sql = 'INSERT INTO users (name, email, phone_no, age) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, phone_no, age], (err) => {
    if (err) return res.send('Database error');
    res.redirect('/');
  });
});

// READ ALL
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.send('Error fetching users');
    res.json(results);
  });
});

// READ ONE
app.get('/users/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// UPDATE
// app.post('/users/:id', (req, res) => {
//   const { name, email, phone_no, age } = req.body;
//   const { id } = req.params;
//   db.query('UPDATE users SET name = ?, email = ?, phone_no = ?, age = ? WHERE id = ?', 
//     [name, email, phone_no, age, id], 
//     (err) => {
//       if (err) return res.send('Error updating user');
//       res.redirect('/');
//     });
// });
app.put('/users/:id', (req, res) => {
  const { name, email, phone_no, age } = req.body;
  const { id } = req.params;

  const sql = 'UPDATE users SET name = ?, email = ?, phone_no = ?, age = ? WHERE id = ?';
  db.query(sql, [name, email, phone_no, age, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'User updated successfully' });
  });
});


// // DELETE
app.delete('/users/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully');
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
