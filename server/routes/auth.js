const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');

const router = express.Router();

function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.name,
    shopName: row.shop_name || null
  };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, shopName } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
    }

    const userRole = role === 'seller' ? 'seller' : 'user';

    if (userRole === 'seller' && !String(shopName || '').trim()) {
      return res.status(400).json({ ok: false, error: 'Shop name is required for seller accounts.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length) {
      return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
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

    const user = toPublicUser({
      id,
      email: normalizedEmail,
      role: userRole,
      name: displayName,
      shop_name: shop
    });

    res.status(201).json({ ok: true, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ ok: false, error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const rows = await query(
      'SELECT id, email, password_hash, role, name, shop_name FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const row = rows[0];
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    res.json({ ok: true, user: toPublicUser(row) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ ok: false, error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
