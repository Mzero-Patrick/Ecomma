const { getPool } = require('../server/db');

module.exports = async (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    await getPool().query('SELECT 1');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, service: 'ecomma-api', database: 'connected' }));
  } catch (err) {
    res.statusCode = 503;
    res.end(JSON.stringify({
      ok: false,
      service: 'ecomma-api',
      database: 'disconnected',
      error: err.message
    }));
  }
};
