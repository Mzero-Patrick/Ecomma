# Ecomma

**Digital marketplace for home & living essentials — built for Rwanda.**

[![GitHub](https://img.shields.io/badge/GitHub-Mzero--Patrick%2FEcomma-181717?logo=github)](https://github.com/Mzero-Patrick/Ecomma)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20Node.js%20%7C%20MySQL-blue)](#tech-stack)
[![Products](https://img.shields.io/badge/Catalog-276%2B%20products-green)](#catalog)

> **Live repo:** [github.com/Mzero-Patrick/Ecomma](https://github.com/Mzero-Patrick/Ecomma)

---

## About the project

**Ecomma** is a full-stack e-commerce platform focused on everyday home essentials — furniture, kitchenware, bathroom items, decor, outdoor & garden, garage tools, bedroom, cleaning, pet supplies, and baby products.

The goal is to be Rwanda’s **one-stop online shopping focal point** for life essentials: browse by room, search products, manage a cart and wishlist, register as a shopper or seller, and operate the marketplace through dedicated admin and seller dashboards.

### What is built today

| Area | Details |
|------|---------|
| **Marketplace** | Hero, 10 category filters, 276+ products, search, cart, wishlist |
| **Checkout** | MTN MoMo, Airtel Money, Cash on Delivery — orders saved in MySQL |
| **Order history** | Shoppers track status; admins update confirmed → shipped → delivered |
| **Auth** | Register / login with roles: **Shopper**, **Seller**, **Admin** |
| **Seller dashboard** | Add and manage your own product listings |
| **Admin dashboard** | View all products, publish listings, remove items |
| **Database** | MySQL (XAMPP) — users, products, hashed passwords |
| **API** | Node.js + Express REST API (`/api/auth`, `/api/products`) |
| **Location** | Rwanda-focused copy, Google Maps embed, local seller names |

### User roles

| Role | Access |
|------|--------|
| **Shopper** | Browse, search, cart, wishlist, checkout, order history |
| **Seller** | Everything shoppers have + seller dashboard to list products |
| **Admin** | Full catalog control + hidden admin login entrance |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Backend | Node.js, Express |
| Database | MySQL / MariaDB (XAMPP) |
| Auth | bcrypt password hashing, localStorage sessions |
| Images | Picsum CDN (deterministic per product) |
| Fonts | DM Sans, Fraunces (Google Fonts) |

---

## Project structure

```
Ecomma/
├── index.html              # Marketplace homepage
├── login.html              # Sign in (shopper / seller / admin)
├── register.html           # Create account
├── admin/dashboard.html    # Admin panel
├── seller/dashboard.html   # Seller panel
├── js/
│   ├── catalog.js          # 10 categories, 276 products (source of truth)
│   ├── images.js           # Product thumbnail URLs
│   ├── auth.js             # Login / register API client
│   ├── products-store.js   # Products API client
│   └── app.js              # Marketplace UI logic
├── css/style.css           # Full site styling
├── database/schema.sql     # MySQL tables (users, products)
├── server/                 # Express API + seed data
│   ├── index.js
│   ├── routes/             # auth.js, products.js
│   └── .env.example
├── DATABASE.md             # Database setup guide
└── README.md               # This file
```

---

## Quick start

### 1. Clone the repo

```powershell
git clone https://github.com/Mzero-Patrick/Ecomma.git
cd Ecomma
```

### 2. Start MySQL (XAMPP)

Open **XAMPP Control Panel** → start **MySQL**.

The server auto-creates the `ecomma` database on first run. You can also import `database/schema.sql` manually via phpMyAdmin.

### 3. Run the API server

```powershell
cd server
copy .env.example .env
npm install
npm start
```

### 4. Open the site

Go to **http://localhost:3000** — do **not** open `index.html` directly as a file (`file://`), or the API will not work.

See [DATABASE.md](DATABASE.md) for full database documentation.

---

## Default admin account

| Field | Value |
|-------|-------|
| Email | admin@ecomma.rw |
| Password | EcommaAdmin2026 |

**Admin entrance:** on the login page, click the logo **5 times** or **double-click** the footer to reveal admin sign-in.

---

## Catalog

10 home categories, **276 unique products** (no duplicate names):

🛋️ Living Room · 🍳 Kitchen · 🚿 Bathroom · 🎨 Artistic & Decor · 🌳 Outdoor & Garden · 🚗 Garage · 🛏️ Bedroom · 🧹 Cleaning & Laundry · 🐶 Pet Supplies · 👶 Baby & Kids

Product data lives in `js/catalog.js`. Images are generated in `js/images.js`. The server re-seeds and refreshes images on startup.

---

## Push updates to GitHub

If you already have the repo linked locally:

```powershell
cd c:\Users\user\Desktop\html\Ecomma
git add .
git commit -m "Describe your change"
git push origin main
```

**First-time setup** (if remote is not added yet):

```powershell
git init
git branch -M main
git remote add origin https://github.com/Mzero-Patrick/Ecomma.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

Use a [GitHub Personal Access Token](https://github.com/settings/tokens) as your password when prompted.

---

## Roadmap — ideas to level up Ecomma

Below are practical add-ons ordered from **high impact / easier** to **more advanced**. Good options for portfolio growth and real-world use in Rwanda.

### UI & UX (make it look premium)

| Idea | Why |
|------|-----|
| **Product detail pages** | Dedicated page per item with gallery, reviews, “similar products” |
| **Dark mode toggle** | Modern feel; CSS variables make this straightforward |
| **Skeleton loaders** | Show loading placeholders while API fetches products |
| **Toast + micro-animations** | Smoother cart/wishlist feedback (partially started) |
| **Real product photos** | Replace Picsum with uploaded images in `/images/products/` |
| **PWA (Progressive Web App)** | Install on phone like an app; works offline for browsing |

### E-commerce features (core business)

| Idea | Why |
|------|-----|
| **Real checkout + orders table** | Store orders in MySQL; order history for shoppers |
| **MTN MoMo / Airtel Money API** | Local mobile money payments (already mentioned in UI) |
| **Cash on delivery (COD)** | Common in Rwanda; simple order status flow |
| **Order tracking** | Status: placed → confirmed → shipped → delivered |
| **Product reviews & ratings** | Persist reviews in DB instead of static seed values |
| **Email notifications** | Order confirmations via Nodemailer or SendGrid |

### Security & auth (production-ready)

| Idea | Why |
|------|-----|
| **JWT tokens** | Replace localStorage-only sessions with signed HTTP-only cookies |
| **Rate limiting** | Protect login/register from brute force (`express-rate-limit`) |
| **Input validation** | Use `zod` or `joi` on all API routes |
| **HTTPS + env secrets** | Required before any real deployment |

### Advanced technology (portfolio / scale)

| Idea | Why |
|------|-----|
| **React or Vue frontend** | Component-based UI; easier to maintain at scale |
| **TypeScript** | Type-safe API and shared models between client/server |
| **Redis caching** | Cache product list for faster homepage loads |
| **Elasticsearch / Meilisearch** | Fast, typo-tolerant product search |
| **Cloudinary / S3** | Cloud image uploads for seller product photos |
| **Docker Compose** | One command to run MySQL + Node together |
| **GitHub Actions CI** | Auto-test and lint on every push |
| **Deploy to Render / Railway / VPS** | Public demo URL for employers and users |
| **Admin analytics dashboard** | Charts: sales, top categories, active sellers (Chart.js) |
| **WebSockets (Socket.io)** | Live order notifications for sellers and admins |
| **Multi-language (Kinyarwanda + English)** | Better reach across Rwanda |

### Suggested next 3 steps (best ROI)

1. ~~**Product detail page + real checkout flow**~~ — ✅ Checkout + orders with MTN MoMo / Airtel Money / COD
2. **Seller image upload (Cloudinary or local `/uploads`)** — fixes generic photos and looks professional.
3. **JWT auth + deploy to Render/Railway** — public live link for your [GitHub repo](https://github.com/Mzero-Patrick/Ecomma).

---

## Notes

- `server/.env` is **not** committed (local DB password). Copy from `server/.env.example`.
- `server/node_modules/` is ignored — run `npm install` in `server/` after cloning.
- Restart the server after pulling updates so seeded product images refresh in MySQL.

---

## License

This project is open for portfolio and learning use. Add an MIT license file when you are ready to open-source formally.

---

**Built for Rwanda 🇷🇼 · [View on GitHub](https://github.com/Mzero-Patrick/Ecomma)**
