/**
 * server.js
 * Main entry point for the QR Menu backend.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

// --------------- Middleware ---------------
app.use(helmet());
app.use(
    cors({
        origin: FRONTEND_ORIGINS,
        credentials: true,
    })
);
app.use(express.json({ limit: '100kb' }));

// --------------- API Routes ---------------
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', authRoutes);

// --------------- Health ---------------
app.get('/', (_req, res) => {
    res.json({ message: 'QR Menu API is running' });
});

app.get('/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});

// --------------- Startup validation ---------------
function validateEnv() {
    const required = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_PASSWORD_HASH'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('   Copy backend/.env.example to backend/.env and set values.');
        process.exit(1);
    }
}

validateEnv();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
