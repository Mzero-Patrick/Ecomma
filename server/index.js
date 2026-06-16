require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { initDatabase } = require('./init-db');
const { runSeed } = require('./seed');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ecomma-api' });
});

app.use(express.static(ROOT));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const filePath = path.join(ROOT, req.path === '/' ? 'index.html' : req.path);
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

async function start() {
  try {
    await initDatabase();
    await pool.query('SELECT 1');
    await runSeed();

    app.listen(PORT, () => {
      console.log(`Ecomma server running at http://localhost:${PORT}`);
      console.log('Open the site in your browser at that URL (not as a file:// link).');
    });
  } catch (err) {
    console.error('\nCould not connect to MySQL. Make sure XAMPP MySQL is running.');
    console.error('1. Start Apache + MySQL in XAMPP Control Panel');
    console.error('2. Or import database/schema.sql in phpMyAdmin (optional — server auto-creates on start)');
    console.error('3. Copy server/.env.example to server/.env and set DB_PASSWORD if needed\n');
    console.error(err.message);
    process.exit(1);
  }
}

start();
