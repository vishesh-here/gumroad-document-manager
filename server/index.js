require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 9000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:9001'
}));
app.use(express.json());

// Database setup
const db = new sqlite3.Database('documents.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    is_admin BOOLEAN DEFAULT 0
  )`);

  // Documents table
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    content TEXT,
    creator_name TEXT,
    price DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run('INSERT OR IGNORE INTO users (email, password, is_admin) VALUES (?, ?, ?)',
    ['admin@example.com', adminPassword, true]);

  // Insert default user
  const userPassword = bcrypt.hashSync('user123', 10);
  db.run('INSERT OR IGNORE INTO users (email, password, is_admin) VALUES (?, ?, ?)',
    ['user@example.com', userPassword, false]);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, isAdmin: user.is_admin });
  });
});

// Get all documents
app.get('/api/documents', authenticateToken, (req, res) => {
  db.all('SELECT id, name, creator_name, price, created_at FROM documents', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get document preview
app.get('/api/documents/:id/preview', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, name, creator_name, price, created_at, substr(content, 1, 200) as preview FROM documents WHERE id = ?',
    [req.params.id],
    (err, document) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(document);
    }
  );
});

// Get full document
app.post('/api/documents/:id/full', authenticateToken, (req, res) => {
  const { password } = req.body;
  if (password !== '1234') {
    return res.status(401).json({ error: 'Invalid password' });
  }

  db.get('SELECT * FROM documents WHERE id = ?', [req.params.id], (err, document) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  });
});

// Upload new document (admin only)
app.post('/api/documents', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, content, creator_name, price } = req.body;

  db.run(
    'INSERT INTO documents (name, content, creator_name, price) VALUES (?, ?, ?, ?)',
    [name, content, creator_name, price],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 