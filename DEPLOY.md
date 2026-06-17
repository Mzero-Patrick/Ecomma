# Deploy Ecomma to Vercel

Vercel hosts the **frontend** and **API** (`/api/*` serverless functions).  
You still need a **cloud MySQL database** — XAMPP on your PC is not reachable from Vercel.

## 1. Create a cloud MySQL database

Use any of these (free tiers available):

| Provider | Notes |
|----------|--------|
| [Railway](https://railway.app) | Add MySQL plugin, copy connection variables |
| [Aiven](https://aiven.io) | MySQL free trial |
| [TiDB Cloud](https://tidbcloud.com) | MySQL-compatible |

Import `database/schema.sql` via their web console or CLI (optional — the app auto-creates tables on first request).

## 2. Add environment variables in Vercel

In your project: **Settings → Environment Variables** → add:

| Variable | Example | Required |
|----------|---------|----------|
| `DB_HOST` | `containers-us-west-xxx.railway.app` | Yes |
| `DB_PORT` | `3306` | Yes |
| `DB_USER` | `root` | Yes |
| `DB_PASSWORD` | your password | Yes |
| `DB_NAME` | `ecomma` | Yes |
| `DB_SSL` | `true` | Yes (cloud MySQL) |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` | Recommended for Railway |
| `ADMIN_EMAIL` | `admin@ecomma.rw` | Optional |
| `ADMIN_PASSWORD` | `EcommaAdmin2026` | Optional |
| `PAYMENT_DEMO_MODE` | `true` | Optional |

**Or** use a single connection string:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/ecomma` |

## 3. Deploy

Push to GitHub — Vercel redeploys automatically.

Required files (already in repo):

- `vercel.json` — routes `/api/*` to serverless handler
- `api/index.js` — Express API for Vercel
- `package.json` — dependencies at project root

## 4. Test

1. Open `https://your-project.vercel.app/api/health`  
   Expected: `{"ok":true,"service":"ecomma-api"}`

2. If you see an error, check **Vercel → Deployments → Functions → Logs**.

3. Open `https://your-project.vercel.app/login.html` and sign in.

## Local vs production

| | Local | Vercel |
|---|--------|--------|
| Site URL | `http://localhost:3000` | `https://*.vercel.app` |
| Database | XAMPP MySQL (`127.0.0.1`) | Cloud MySQL env vars |
| Start server | `cd server && npm start` | Automatic (serverless) |

## Troubleshooting

| Error | Fix |
|-------|-----|
| Invalid server response | Redeploy after adding `vercel.json` + `api/index.js` |
| Database unavailable | Set `DB_*` or `DATABASE_URL` in Vercel env vars |
| Login works locally but not online | Cloud DB not configured or wrong credentials |
| **504 Gateway Timeout** | Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true` in Vercel env vars and redeploy. First login should respond in seconds after redeploy. |
| Slow first login | Normal on cold start — retry once. Catalog seed runs only when loading products, not on login. |
