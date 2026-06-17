const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

function isCloudDatabase() {
  if (process.env.DATABASE_URL) return true;
  const host = process.env.DB_HOST || '127.0.0.1';
  return host !== '127.0.0.1' && host !== 'localhost';
}

function getSslConfig() {
  if (process.env.DB_SSL === 'false') return undefined;
  const strict = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';
  return { rejectUnauthorized: strict };
}

function getPoolConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      ssl: getSslConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
      multipleStatements: true
    };
  }

  const host = process.env.DB_HOST || '127.0.0.1';
  const useSsl = process.env.DB_SSL === 'true' || isCloudDatabase();

  return {
    host,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecomma',
    ssl: useSsl ? getSslConfig() : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
    multipleStatements: true
  };
}

const pool = mysql.createPool(getPoolConfig());

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query, getPoolConfig, isCloudDatabase };
