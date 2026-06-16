# Ecomma

Rwanda home & living marketplace — HTML frontend with Node.js + MySQL (XAMPP) backend.

## Quick start

1. Start **MySQL** in XAMPP Control Panel.
2. Install and run the API server:

```powershell
cd server
copy .env.example .env
npm install
npm start
```

3. Open **http://localhost:3000** (do not open `index.html` as a file).

See [DATABASE.md](DATABASE.md) for database details.

## Default admin

| Email | Password |
|-------|----------|
| admin@ecomma.rw | EcommaAdmin2026 |

Use the hidden admin entrance on the login page (5× click logo or double-click footer).

## Project structure

```
Ecomma/
├── index.html          # Marketplace home
├── login.html          # Sign in
├── register.html       # Create account
├── admin/              # Admin dashboard
├── seller/             # Seller dashboard
├── js/                 # Frontend scripts + catalog
├── css/                # Styles
├── database/           # MySQL schema
└── server/             # Express API + MySQL
```

## Push to GitHub

Run these commands **inside the Ecomma folder** (`c:\Users\user\Desktop\html\Ecomma`):

### 1. Initialize git (first time only)

```powershell
cd c:\Users\user\Desktop\html\Ecomma
git init
git branch -M main
```

### 2. Stage and commit

```powershell
git add .
git status
git commit -m "Add Ecomma marketplace with MySQL auth, 276-product catalog, and API server"
```

### 3. Create a GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name it `Ecomma` (or any name you prefer)
3. Leave it **empty** — do not add README, .gitignore, or license (you already have them locally)
4. Click **Create repository**

### 4. Connect remote and push

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/Ecomma.git
git push -u origin main
```

If GitHub asks you to sign in, use a **Personal Access Token** as the password (Settings → Developer settings → Personal access tokens).

### 5. After future changes

```powershell
cd c:\Users\user\Desktop\html\Ecomma
git add .
git commit -m "Describe your change here"
git push
```

## Notes

- `server/.env` is ignored by git (contains local DB settings). Copy from `server/.env.example` on each machine.
- `server/node_modules/` is ignored — run `npm install` in `server/` after cloning.
- Restart the server after pulling updates so seeded product images refresh in MySQL.
