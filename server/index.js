const path = require('path');
const { createApp, ensureFull } = require('./app');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');
const app = createApp();

app.use(require('express').static(ROOT));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const filePath = path.join(ROOT, req.path === '/' ? 'index.html' : req.path);
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

ensureFull()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Ecomma server running at http://localhost:${PORT}`);
      console.log('Open the site in your browser at that URL (not as a file:// link).');
    });
  })
  .catch((err) => {
    console.error('\nCould not connect to MySQL. Make sure XAMPP MySQL is running.');
    console.error('1. Start MySQL in XAMPP Control Panel');
    console.error('2. Or set cloud DATABASE_URL / DB_* variables for production\n');
    console.error(err.message);
    process.exit(1);
  });
