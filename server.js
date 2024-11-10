const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'geotrip'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

app.post('/login', (req, res) => {
  const { name, password } = req.body;
  const query = 'SELECT * FROM user WHERE name = ? AND password = ?';
  db.query(query, [name, password], (err, results) => {
    if (err) {
      res.status(500).send('Error querying the database');
      return;
    }
    if (results.length > 0) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const query = 'INSERT INTO user (name, email, type_user, password, registration_date) VALUES (?, ?, 2, ?, NOW())';
  db.query(query, [name, email, password], (err, results) => {
    if (err) {
      res.status(500).send('Error inserting into the database');
      return;
    }
    res.status(201).send('User registered successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});