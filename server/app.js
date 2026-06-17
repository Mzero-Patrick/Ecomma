const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { initDatabase } = require('./init-db');
const { runSeed } = require('./seed');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

let readyPromise = null;

async function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await initDatabase();
      await pool.query('SELECT 1');
      await runSeed();
    })();
  }
  return readyPromise;
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ ok: false, error: 'Invalid JSON in request body.' });
    }
    next(err);
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, service: 'ecomma-api', database: 'connected' });
    } catch (err) {
      res.status(503).json({
        ok: false,
        service: 'ecomma-api',
        database: 'disconnected',
        error: 'Configure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (and DB_SSL=true) in Vercel env vars.'
      });
    }
  });

  app.use(async (req, res, next) => {
    if (req.path === '/api/health') return next();
    try {
      await ensureReady();
      next();
    } catch (err) {
      console.error('Database init failed:', err.message);
      res.status(503).json({
        ok: false,
        error: 'Database unavailable. Configure MySQL environment variables on the server.'
      });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ ok: false, error: 'API route not found.' });
  });

  return app;
}

module.exports = { createApp, ensureReady };
