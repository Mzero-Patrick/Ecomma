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

    let body = await readJsonBody(req);

    const { email, password } = body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const rows = await query(
      'SELECT id, email, password_hash, role, name, shop_name FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (!rows.length) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ ok: false, error: 'Invalid email or password.' }));
    }

    const row = rows[0];
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ ok: false, error: 'Invalid email or password.' }));
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, user: toPublicUser(row) }));
  } catch (err) {
    console.error('Login error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: 'Login failed. Please try again.' }));
  }
};
