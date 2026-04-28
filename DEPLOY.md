# Deployment guide

This app is split into **frontend** (static React) and **backend** (Node/Express API). Deploy them to two hosts and connect them with environment variables.

## 1. Prerequisites

1. **MongoDB Atlas** (or self-hosted MongoDB): create a database user and get a connection string (`MONGO_URI`).
2. After any past leak of credentials, **rotate the database password** in Atlas before going live.
3. Generate secrets on your machine:

```bash
cd backend
npm install
npm run hash-password -- "YourStrongUniquePassword"
```

Copy the printed hash into `ADMIN_PASSWORD_HASH`.

Pick a long random string for `JWT_SECRET` (32+ characters).

## 2. Deploy the backend (Render example)

1. Create a **Web Service** on [Render](https://render.com), connect this repo, set **Root Directory** to `backend`.
2. **Build command:** `npm install`  
   **Start command:** `npm start`
3. **Health check path:** `/health`
4. Set environment variables:

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | long random string |
| `ADMIN_PASSWORD_HASH` | output of `npm run hash-password` |
| `FRONTEND_ORIGINS` | `https://your-app.vercel.app` (comma-separated if multiple) |

Render sets `PORT` automatically; Express uses `process.env.PORT`.

5. Note the public API URL, e.g. `https://qr-menu-api.onrender.com`.

### Railway

Same idea: Node service, root `backend`, `npm start`, same env vars.

## 3. Deploy the frontend (Vercel example)

1. Import the repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. **Framework preset:** Vite  
4. Add environment variable:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://qr-menu-api.onrender.com` (no trailing slash) |

5. Deploy. Customer URLs look like:  
   `https://your-app.vercel.app/menu?table=5`

## 4. CORS

The backend only allows origins listed in `FRONTEND_ORIGINS`. After each new Vercel preview domain you use, add it to `FRONTEND_ORIGINS` (comma-separated) or use a stable production domain only.

## 5. QR codes

Point QR codes at your **frontend** URL, not the API:

```text
https://your-app.vercel.app/menu?table=1
```

## 6. Smoke test after deploy

- Open `https://<api>/health` → JSON `{ ok: true, ... }`
- Open menu on the frontend → items load.
- Admin `/admin` → login with your chosen password → CRUD works.
- Kitchen `/kitchen` → lists pending orders.

## 7. If credentials were ever committed

1. Rotate MongoDB user password in Atlas.
2. Change `ADMIN_PASSWORD_HASH` (new `hash-password` run).
3. Rotate `JWT_SECRET` (invalidates all existing staff tokens).
