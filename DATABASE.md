# Ecomma — MySQL Database Setup (XAMPP)

This project uses **MySQL via XAMPP** for storing users (login/register) and products.

## Why MySQL (XAMPP)?

- Structured data fits e-commerce well (users, sellers, products)
- phpMyAdmin makes it easy to view and manage data locally
- Works great on Windows with the XAMPP stack you likely already use

## Prerequisites

1. [XAMPP](https://www.apachefriends.org/) installed
2. [Node.js](https://nodejs.org/) (LTS) installed

## Setup steps

### 1. Start MySQL in XAMPP

Open **XAMPP Control Panel** and start **MySQL** (Apache is optional — the Node server serves the site).

### 2. Create the database (optional)

The server **auto-creates** the `ecomma` database and tables on first start.

You can also import manually via phpMyAdmin if you prefer — use `database/schema.sql`.

### 3. Configure the server

```bash
cd server
copy .env.example .env
npm install
```

Edit `server/.env` if your MySQL password is not empty:

```
DB_PASSWORD=your_mysql_password
```

### 4. Start the Ecomma server

```bash
cd server
npm start
```

Open **http://localhost:3000** in your browser.

> Important: Use the server URL, not `file://` — the frontend needs the API.

## Default admin account

Created automatically on first server start:

| Field    | Value              |
|----------|--------------------|
| Email    | admin@ecomma.rw    |
| Password | EcommaAdmin2026    |

Use the hidden admin entrance on the login page (5× click logo or double-click footer).

## API endpoints

| Method | Path                        | Description        |
|--------|-----------------------------|--------------------|
| POST   | `/api/auth/register`        | Create account     |
| POST   | `/api/auth/login`           | Sign in            |
| GET    | `/api/products`             | List all products  |
| GET    | `/api/products/seller/:id`  | Seller's products  |
| POST   | `/api/products`             | Add product        |
| DELETE | `/api/products/:id`         | Remove (admin)     |

## Database tables

- **users** — email, hashed password, role (`user` / `seller` / `admin`), shop name
- **products** — name, category, price, seller, soft-delete flag

View or edit data anytime in phpMyAdmin under the `ecomma` database.
