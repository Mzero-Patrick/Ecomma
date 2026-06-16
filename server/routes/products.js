const express = require('express');
const { query } = require('../db');
const { CATEGORIES } = require('../../js/catalog');
const { getProductImage } = require('../../js/images');

const router = express.Router();

function getCategoryName(categoryId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.name : categoryId;
}

function getCategoryIcon(categoryId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.icon : '📦';
}

function productImageUrl(name, categoryId) {
  return getProductImage(name, categoryId);
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryName: row.category_name,
    icon: row.icon,
    image: row.image,
    price: row.price,
    rating: String(Number(row.rating).toFixed(1)),
    reviews: row.reviews,
    seller: row.seller,
    sellerId: row.seller_id,
    addedBy: row.added_by,
    createdAt: row.created_at
  };
}

router.get('/', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT id, name, category, category_name, icon, image, price, rating, reviews,
              seller, seller_id, added_by, created_at
       FROM products
       WHERE is_deleted = 0
       ORDER BY id ASC`
    );
    res.json({ ok: true, products: rows.map(mapProduct) });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ ok: false, error: 'Could not load products.' });
  }
});

router.get('/seller/:sellerId', async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, name, category, category_name, icon, image, price, rating, reviews,
              seller, seller_id, added_by, created_at
       FROM products
       WHERE is_deleted = 0 AND seller_id = ?
       ORDER BY id DESC`,
      [req.params.sellerId]
    );
    res.json({ ok: true, products: rows.map(mapProduct) });
  } catch (err) {
    console.error('Seller products error:', err);
    res.status(500).json({ ok: false, error: 'Could not load seller products.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, category, price, image, seller, session } = req.body;

    if (!session?.id || !session?.role) {
      return res.status(401).json({ ok: false, error: 'You must be signed in.' });
    }

    if (session.role !== 'seller' && session.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'You do not have permission to add products.' });
    }

    const productName = String(name || '').trim();
    const productCategory = String(category || '').trim();
    const productPrice = Number(price);

    if (!productName || !productCategory || !productPrice || productPrice <= 0) {
      return res.status(400).json({ ok: false, error: 'Please fill in all product fields with valid values.' });
    }

    const sellerName = session.role === 'admin'
      ? (String(seller || '').trim() || 'Ecomma Official')
      : (session.shopName || session.name);

    const createdAt = Date.now();
    const result = await query(
      `INSERT INTO products
        (name, category, category_name, icon, image, price, rating, reviews, seller, seller_id, added_by, is_deleted, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 4.0, 0, ?, ?, ?, 0, ?)`,
      [
        productName,
        productCategory,
        getCategoryName(productCategory),
        getCategoryIcon(productCategory),
        String(image || '').trim() || productImageUrl(productName, productCategory),
        Math.round(productPrice),
        sellerName,
        session.id,
        session.role,
        createdAt
      ]
    );

    const rows = await query(
      `SELECT id, name, category, category_name, icon, image, price, rating, reviews,
              seller, seller_id, added_by, created_at
       FROM products WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json({ ok: true, product: mapProduct(rows[0]) });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ ok: false, error: 'Could not add product.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { session } = req.body;

    if (!session?.id || session.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Only administrators can remove products.' });
    }

    const productId = Number(req.params.id);
    if (!productId) {
      return res.status(400).json({ ok: false, error: 'Invalid product id.' });
    }

    await query('UPDATE products SET is_deleted = 1 WHERE id = ?', [productId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Remove product error:', err);
    res.status(500).json({ ok: false, error: 'Could not remove product.' });
  }
});

module.exports = router;
