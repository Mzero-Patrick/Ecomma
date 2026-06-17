const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { getPoolConfig, isCloudDatabase } = require('./db');

async function cloudTablesExist(pool) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = 'users'`
  );
  return rows[0].count > 0;
}

async function initDatabase() {
  const cloud = isCloudDatabase();
  const schemaFile = cloud ? 'tables.sql' : 'schema.sql';
  const schemaPath = path.join(__dirname, '..', 'database', schemaFile);
  const schema = fs.readFileSync(schemaPath, 'utf8');

  if (cloud) {
    const { getPool } = require('./db');
    if (await cloudTablesExist(getPool())) return;
    await getPool().query(schema);
    console.log('Cloud database tables ready.');
    return;
  }

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  const dbName = process.env.DB_NAME || 'ecomma';
  const connection = await mysql.createConnection(config);
  await connection.query(schema);
  await connection.end();
  console.log(`Database "${dbName}" is ready.`);
}

module.exports = { initDatabase };
