const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const QRCode = require('qrcode');

const app = express();
const port = 3000;

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public')); // serve static files like index.html

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});

// CREATE

app.post('/users', upload.single('image'), (req, res) => {
  const { name, email, phone_no, age } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !email || !phone_no || !age) {
    return res.send('All fields are required');
  }

  const sql = 'INSERT INTO users (name, email, phone_no, age, image) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, phone_no, age, image], (err) => {
    if (err) return res.send('Database error');
    res.redirect('/');
  });
});


// READ ALL with pagination
app.get('/users', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;
  let offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) as count FROM users';
  const dataQuery = 'SELECT * FROM users LIMIT ? OFFSET ?';

  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).send('Error fetching user count');

    const totalUsers = countResult[0].count;
    const totalPages = Math.ceil(totalUsers / limit);

    db.query(dataQuery, [limit, offset], (err, results) => {
      if (err) return res.status(500).send('Error fetching users');

      res.json({
        users: results,
        currentPage: page,
        totalPages
      });
    });
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
// app.put('/users/:id', (req, res) => {
//   const { name, email, phone_no, age } = req.body;
//   // const image = req.file ? req.file.filename : null;
//   const { id } = req.params;

//   const sql = 'UPDATE users SET name = ?, email = ?, phone_no = ?, age = ? WHERE id = ?';
//   db.query(sql, [name, email, phone_no, age, id,], (err, result) => {
//     if (err) return res.status(500).json({ error: 'Update failed' });
//     res.json({ message: 'User updated successfully' });
//   });
// });


app.put('/users/:id', upload.single('image'), (req, res) => {
  const { name, email, phone_no, age } = req.body;
  const { id } = req.params;
  const image = req.file ? req.file.filename : null;

  let sql, values;

  if (image) {
    sql = 'UPDATE users SET name = ?, email = ?, phone_no = ?, age = ?, image = ? WHERE id = ?';
    values = [name, email, phone_no, age, image, id];
  } else {
    sql = 'UPDATE users SET name = ?, email = ?, phone_no = ?, age = ? WHERE id = ?';
    values = [name, email, phone_no, age, id];
  }

  db.query(sql, values, (err, result) => {
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




app.post('/generate-qr', (req, res) => {
  const text = req.body.qrdata;

  if (!text) return res.send('Text is required');

  const filename = `qr_${Date.now()}.png`;
  const filepath = path.join(__dirname, 'public/qrcodes', filename);

  // Ensure directory exists
  const fs = require('fs');
  const dir = path.join(__dirname, 'public/qrcodes');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  QRCode.toFile(filepath, text, function (err) {
    if (err) return res.send('Failed to generate QR code');

    // Redirect to show image
    res.redirect(`/qrcodes/${filename}`);
  });
});
