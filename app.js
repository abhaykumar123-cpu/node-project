const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/db');
const QRCode = require('qrcode');
const sendContactEmail = require('./mailer');
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
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'qr.html'));
});
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});
app.get('/expense', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'expense.html'));
});
app.get('/unit', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'unit.html'));
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


// QR Code 
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



// POST /send-email
app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.send('All fields are required.');
  }

  try {
    await sendContactEmail(name, email, subject, message);
    res.send('Message sent successfully!');
  } catch (err) {
    console.error(err);
    res.send('Failed to send message.');
  }
});



app.post('/convert', (req, res) => {
  const { value, unit } = req.body;
  const num = parseFloat(value);

  let result = {};

  switch (unit) {
    case 'meters':
      result = {
        kilometers: (num / 1000).toFixed(2),
        feet: (num * 3.281).toFixed(2),
        inches: (num * 39.37).toFixed(2),
      };
      break;
    case 'kilograms':
      result = {
        grams: (num * 1000).toFixed(2),
        pounds: (num * 2.2046).toFixed(2),
      };
      break;
    case 'celsius':
      result = {
        fahrenheit: ((num * 9) / 5 + 32).toFixed(2),
        kelvin: (num + 273.15).toFixed(2),
      };
      break;
    default:
      result = { error: 'Invalid unit' };
  }

  res.json(result);
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


