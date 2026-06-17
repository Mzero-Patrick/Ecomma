const mysql = require('mysql2/promise');

module.exports = async (_req, res) => {
  const host = process.env.DB_HOST || 'unset';
  const port = Number(process.env.DB_PORT) || 3306;
  const start = Date.now();

  res.setHeader('Content-Type', 'application/json');

  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'railway',
      connectTimeout: 8000
    });
    await conn.query('SELECT 1 AS ok');
    await conn.end();
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ms: Date.now() - start, host, port }));
  } catch (err) {
    res.statusCode = 503;
    res.end(JSON.stringify({
      ok: false,
      error: err.message,
      code: err.code,
      ms: Date.now() - start,
      host,
      port,
      hasPassword: Boolean(process.env.DB_PASSWORD)
    }));
  }
};
