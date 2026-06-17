const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { initDatabase } = require('./init-db');
const { ensureAdminUser, ensureSampleProducts } = require('./seed');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const STARTUP_TIMEOUT_MS = Number(process.env.STARTUP_TIMEOUT_MS) || 15000;

let coreReadyPromise = null;
let fullReadyPromise = null;

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${STARTUP_TIMEOUT_MS}ms`)), STARTUP_TIMEOUT_MS);
    })
  ]);
}

async function ensureCore() {
  if (!coreReadyPromise) {
    coreReadyPromise = withTimeout((async () => {
      await initDatabase();
      await pool.query('SELECT 1');
      await ensureAdminUser();
    })(), 'Database startup');
  }
  return coreReadyPromise;
}

async function ensureFull() {
  if (!fullReadyPromise) {
    fullReadyPromise = withTimeout((async () => {
      await ensureCore();
      await ensureSampleProducts();
    })(), 'Catalog seed');
  }
  return fullReadyPromise;
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
      await withTimeout(pool.query('SELECT 1'), 'Health check');
      res.json({ ok: true, service: 'ecomma-api', database: 'connected' });
    } catch (err) {
      res.status(503).json({
        ok: false,
        service: 'ecomma-api',
        database: 'disconnected',
        error: err.message || 'Configure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in Vercel env vars.'
      });
    }
  });

  app.use('/api/auth', async (req, res, next) => {
    try {
      await ensureCore();
      next();
    } catch (err) {
      console.error('Auth startup failed:', err.message);
      res.status(503).json({
        ok: false,
        error: 'Database unavailable. Check Vercel MySQL environment variables.'
      });
    }
  }, authRoutes);

  app.use('/api/products', async (req, res, next) => {
    try {
      await ensureFull();
      next();
    } catch (err) {
      console.error('Products startup failed:', err.message);
      res.status(503).json({ ok: false, error: 'Catalog unavailable. Try again shortly.' });
    }
  }, productRoutes);

  app.use('/api/orders', async (req, res, next) => {
    try {
      await ensureCore();
      next();
    } catch (err) {
      console.error('Orders startup failed:', err.message);
      res.status(503).json({ ok: false, error: 'Database unavailable.' });
    }
  }, orderRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ ok: false, error: 'API route not found.' });
  });

  return app;
}

module.exports = { createApp, ensureCore, ensureFull };
