const bcrypt = require('bcryptjs');
const { query } = require('../../server/db');
const { ensureAdminUser } = require('../../server/seed');
const { initDatabase } = require('../../server/init-db');

let ready = null;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (_err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

async function ensureReady() {
  if (!ready) {
    ready = (async () => {
      await initDatabase();
      await ensureAdminUser();
    })();
  }
  return ready;
}

function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.name,
    shopName: row.shop_name || null
  };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'Method not allowed.' }));
  }

  try {
    await ensureReady();
    const body = await readJsonBody(req);
    const { email, password, role, name, shopName } = body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'Email and password are required.' }));
    }

    if (password.length < 6) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'Password must be at least 6 characters.' }));
    }

    const userRole = role === 'seller' ? 'seller' : 'user';

    if (userRole === 'seller' && !String(shopName || '').trim()) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'Shop name is required for seller accounts.' }));
    }

    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length) {
      res.statusCode = 409;
      return res.end(JSON.stringify({ ok: false, error: 'An account with this email already exists.' }));
    }

    const id = `user-${Date.now()}`;
    const hash = await bcrypt.hash(password, 10);
    const displayName = String(name || '').trim() || normalizedEmail.split('@')[0];
    const shop = userRole === 'seller' ? String(shopName).trim() : null;
    const createdAt = Date.now();

    await query(
      `INSERT INTO users (id, email, password_hash, role, name, shop_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, normalizedEmail, hash, userRole, displayName, shop, createdAt]
    );

    res.statusCode = 201;
    res.end(JSON.stringify({
      ok: true,
      user: toPublicUser({
        id,
        email: normalizedEmail,
        role: userRole,
        name: displayName,
        shop_name: shop
      })
    }));
  } catch (err) {
    console.error('Register error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: 'Registration failed. Please try again.' }));
  }
};
