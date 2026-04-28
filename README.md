# QR Code Based Restaurant Menu System

Full-stack QR menu: customers open a link, browse the menu, and place orders. Staff use **Admin** (menu CRUD) and **Kitchen** (order queue) with JWT-protected APIs.

## Tech stack

| Layer       | Technology        |
|------------|-------------------|
| Frontend   | React (Vite)      |
| Backend    | Node.js + Express |
| Database   | MongoDB (Mongoose)|
| Auth       | bcrypt + JWT      |

## Security first

- **Never commit** `backend/.env` or real connection strings. Use [`backend/.env.example`](backend/.env.example) as a template.
- If this repo (or any copy) ever contained real `MONGO_URI` or passwords in git history, **rotate** the Atlas DB user password and replace `ADMIN_PASSWORD_HASH` / `JWT_SECRET` before production.
- To remove accidentally committed `node_modules` or `dist` from git tracking (keep files locally):

  ```bash
  git rm -r --cached frontend/node_modules backend/node_modules frontend/dist 2>nul
  ```

## Project structure

```text
qr-menu-project/
├── backend/
│   ├── controllers/
│   ├── middleware/       # JWT auth for staff routes
│   ├── models/
│   ├── routes/
│   ├── scripts/          # hash-password helper
│   ├── server.js
│   ├── seed.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js # Axios + VITE_API_URL + staff JWT
│   │   ├── pages/
│   │   └── ...
│   ├── vite.config.js
│   └── .env.example
├── .github/workflows/ci.yml
├── render.yaml           # optional Render blueprint
├── DEPLOY.md             # step-by-step hosting
└── README.md
```

## Prerequisites

- **Node.js** 18+ (CI uses 20)
- **MongoDB** — local (`mongodb://localhost:27017/qr-menu`) or [MongoDB Atlas](https://www.mongodb.com/atlas)

## Environment variables

### Backend (`backend/.env`)

Copy from example:

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `5000` locally) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign staff JWTs |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of staff password (see below) |
| `FRONTEND_ORIGINS` | Comma-separated CORS origins (e.g. `http://localhost:3000`) |
| `JWT_EXPIRES_IN` | Optional JWT lifetime (default `8h`) |

Generate a password hash:

```bash
cd backend
npm install
npm run hash-password -- "YourStrongPassword"
```

Paste the output into `ADMIN_PASSWORD_HASH` in `.env`.

The committed **`.env.example`** includes a demo hash for the password `changeme` — use only for local testing; choose a strong password for anything public.

### Frontend (`frontend/.env`)

See [`frontend/.env.example`](frontend/.env.example).

- **Local:** leave `VITE_API_URL` empty so `/api` is proxied to the backend (see `vite.config.js`).
- **Production:** set `VITE_API_URL` to your deployed API origin (no trailing slash), e.g. `https://your-api.onrender.com`.

## Getting started

### 1. Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure backend

Ensure `backend/.env` exists (from `.env.example`) with valid `MONGO_URI`, `JWT_SECRET`, and `ADMIN_PASSWORD_HASH`.

### 3. Seed the database (optional)

```bash
cd backend
npm run seed
```

Uses `MONGO_URI` from `.env` (falls back to local `mongodb://localhost:27017/qr-menu` in `seed.js` only).

### 4. Run backend

```bash
cd backend
npm start
# http://localhost:5000 — try GET /health
```

### 5. Run frontend

```bash
cd frontend
npm run dev
# http://localhost:3000
```

### 6. Open the app

- Menu: **http://localhost:3000/menu?table=5**
- Admin: **http://localhost:3000/admin** (staff password)
- Kitchen: **http://localhost:3000/kitchen**

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Load balancer / uptime check |
| GET | `/api/menu` | — | List menu items |
| POST | `/api/menu` | Staff JWT | Create item |
| PUT | `/api/menu/:id` | Staff JWT | Update item |
| DELETE | `/api/menu/:id` | Staff JWT | Delete item |
| POST | `/api/order` | — | Place order |
| GET | `/api/status` | — | Ordering window message |
| GET | `/api/orders` | Staff JWT | Pending orders |
| PATCH | `/api/orders/:id/status` | Staff JWT | Update order status |
| POST | `/api/admin/login` | — | Body `{ password }` → `{ token }` |
| GET | `/api/admin/me` | Staff JWT | Validate JWT |

Staff JWT: `Authorization: Bearer <token>` (handled by [`frontend/src/api/client.js`](frontend/src/api/client.js)).

## Ordering rules

Implemented in [`backend/controllers/orderController.js`](backend/controllers/orderController.js):

- Ordering is **closed** between **10:00 PM and 6:00 AM** (server local time).
- Orders require a **scheduled time** at least **4 hours** ahead.

Adjust the time-window logic in that file if you change business rules.

## QR codes

Encode your **frontend** URL (not the API):

```text
https://<your-frontend-host>/menu?table=<TABLE_NUMBER>
```

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for Vercel + Render (or similar) and env var checklist.

## CI

GitHub Actions runs `npm ci` in `backend` and `npm ci && npm run build` in `frontend` on push/PR to `main`/`master`.

## Working with GitHub (solo → collaborators)

- Keep secrets only in **hosting env vars** and local `.env` (never push `.env`).
- Use **branches + PRs** for changes so CI runs before merge.
- When adding collaborators, they clone the repo, copy `.env.example` → `.env`, and run locally without sharing your secrets in chat.

## License

Use and modify for your homestay or restaurant as needed.
