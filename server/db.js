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

function shouldUseSsl(host) {
  if (process.env.DB_SSL === 'false') return false;
  if (host && host.endsWith('.rlwy.net')) return false;
  if (process.env.DB_SSL === 'true') return true;
  return host !== '127.0.0.1' && host !== 'localhost';
}

function getPoolConfig() {
  const shared = {
    waitForConnections: true,
    connectionLimit: 5,
    charset: 'utf8mb4',
    multipleStatements: true,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 8000
  };

  const explicitHost = process.env.DB_HOST;
  if (explicitHost && explicitHost !== '127.0.0.1' && explicitHost !== 'localhost') {
    const useSsl = shouldUseSsl(explicitHost);
    return {
      ...shared,
      host: explicitHost,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecomma',
      ssl: useSsl ? getSslConfig() : undefined
    };
  }

  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    const host = url.hostname;
    const useSsl = shouldUseSsl(host);
    return {
      ...shared,
      host,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      ssl: useSsl ? getSslConfig() : undefined
    };
  }

  const host = process.env.DB_HOST || '127.0.0.1';
  const useSsl = shouldUseSsl(host);

  return {
    ...shared,
    host,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecomma',
    ssl: useSsl ? getSslConfig() : undefined
  };
}

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(getPoolConfig());
  }
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

module.exports = {
  get pool() {
    return getPool();
  },
  query,
  getPool,
  getPoolConfig,
  isCloudDatabase
};
