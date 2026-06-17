const bcrypt = require('bcryptjs');
const { query } = require('./db');
const { CATEGORIES, CATALOG_PRODUCT_COUNT } = require('../js/catalog');
const { getProductImage } = require('../js/images');

const SELLERS = ['Kigali Home Store', 'Rwanda Decor Co.', 'Kitchen Plus RW', 'Furniture Hub'];
const IS_SERVERLESS = Boolean(process.env.VERCEL);

function generateSampleProducts() {
  const products = [];
  let id = 1;

  CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      const basePrice = Math.floor(Math.random() * 180000) + 15000;
      products.push({
        id: id++,
        name: item,
        category: cat.id,
        category_name: cat.name,
        icon: cat.icon,
        image: getProductImage(item, cat.id),
        price: basePrice,
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 120) + 5,
        seller: SELLERS[Math.floor(Math.random() * SELLERS.length)],
        seller_id: null,
        added_by: 'seed',
        created_at: Date.now()
      });
    });
  });

  return products;
}

async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || 'admin@ecomma.rw').toLowerCase();
  const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length) return;

  const password = process.env.ADMIN_PASSWORD || 'EcommaAdmin2026';
  const hash = await bcrypt.hash(password, 10);

  await query(
    `INSERT INTO users (id, email, password_hash, role, name, shop_name, created_at)
     VALUES (?, ?, ?, 'admin', ?, NULL, ?)`,
    ['admin-1', email, hash, process.env.ADMIN_NAME || 'Platform Admin', Date.now()]
  );

  console.log(`Default admin created: ${email}`);
}

async function insertSeedProducts() {
  const products = generateSampleProducts();
  const chunkSize = 50;

  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)').join(', ');
    const values = chunk.flatMap((p) => [
      p.id, p.name, p.category, p.category_name, p.icon, p.image, p.price,
      p.rating, p.reviews, p.seller, p.seller_id, p.added_by, p.created_at
    ]);

    await query(
      `INSERT INTO products
        (id, name, category, category_name, icon, image, price, rating, reviews, seller, seller_id, added_by, is_deleted, created_at)
       VALUES ${placeholders}`,
      values
    );
  }

  console.log(`Seeded ${products.length} sample products.`);
}

async function refreshSeedProductImages() {
  if (IS_SERVERLESS) return;

  const products = generateSampleProducts();
  for (const p of products) {
    await query(
      `UPDATE products
       SET image = ?, category_name = ?, icon = ?
       WHERE added_by = 'seed' AND category = ? AND name = ?`,
      [p.image, p.category_name, p.icon, p.category, p.name]
    );
  }
  console.log('Updated product images for seeded catalog.');
}

async function ensureSampleProducts() {
  const rows = await query('SELECT COUNT(*) AS count FROM products WHERE is_deleted = 0 AND added_by = ?', ['seed']);
  const seedCount = rows[0].count;

  if (seedCount === 0) {
    await insertSeedProducts();
    return;
  }

  if (seedCount !== CATALOG_PRODUCT_COUNT) {
    await query('DELETE FROM products WHERE added_by = ?', ['seed']);
    console.log('Refreshing seeded products for updated catalog...');
    await insertSeedProducts();
    return;
  }

  await refreshSeedProductImages();
}

async function runSeed() {
  await ensureAdminUser();
  await ensureSampleProducts();
}

module.exports = {
  runSeed,
  ensureAdminUser,
  ensureSampleProducts,
  CATEGORIES,
  CATALOG_PRODUCT_COUNT
};
