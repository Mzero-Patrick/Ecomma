const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  const dbName = process.env.DB_NAME || 'ecomma';
  const connection = await mysql.createConnection(config);

  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  await connection.query(schema);
  await connection.end();

  console.log(`Database "${dbName}" is ready.`);
}

module.exports = { initDatabase };
