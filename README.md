# QR Code Based Restaurant Menu System

A full-stack QR code based restaurant menu and ordering system. Customers scan a QR code on their table, view the menu, add items to cart, and place an order — all from their phone.

## Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Frontend   | React (Vite)             |
| Backend    | Node.js + Express        |
| Database   | MongoDB (Mongoose)       |
| HTTP Client| Axios                    |

## Project Structure

```
qr-menu-project/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── server.js          # Entry point
│   ├── seed.js            # Database seeder
│   └── .env               # Environment config
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Menu and Cart pages
│   │   ├── App.jsx        # Root component with routing
│   │   ├── main.jsx       # React mount point
│   │   └── index.css      # Global styles
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Prerequisites

- **Node.js** (v16+)
- **MongoDB** running locally on `mongodb://localhost:27017`

## Getting Started

### 1. Clone & Install

```bash
# Backend
cd qr-menu-project/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Seed the Database

Populate the menu with sample items:

```bash
cd backend
npm run seed
```

### 3. Start the Backend

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 5. Open the App

Visit: **http://localhost:3000/menu?table=5**

This simulates a customer scanning a QR code at Table 5.

## API Endpoints

| Method | Endpoint      | Description                            |
|--------|---------------|----------------------------------------|
| GET    | `/api/menu`   | Returns all menu items                 |
| POST   | `/api/order`  | Creates a new order                    |
| GET    | `/api/status` | Checks if ordering is currently open   |

### POST /api/order — Body

```json
{
  "tableNumber": 5,
  "items": [
    { "name": "Margherita Pizza", "price": 350, "quantity": 2 }
  ]
}
```

### GET /api/status — Response

```json
{
  "ordering": false,
  "message": "Ordering is closed after 5 PM"
}
```

## Ordering Rules

- Orders are **accepted before 5:00 PM**.
- After 5:00 PM, the menu is visible but ordering is **disabled**.
- The cutoff hour can be changed in `backend/controllers/orderController.js` (`ORDERING_CUTOFF_HOUR`).

## QR Code Setup

Generate a QR code that points to:

```
http://<your-host>:3000/menu?table=<TABLE_NUMBER>
```

The `table` query parameter identifies the table placing the order.
