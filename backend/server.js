/**
 * server.js
 * Main entry point for the QR Menu backend.
 * Sets up Express, connects to MongoDB, and mounts API routes.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- API Routes ---------------
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', authRoutes);

// --------------- Health Check ---------------
app.get('/', (_req, res) => {
  res.json({ message: 'QR Menu API is running' });
});

// --------------- Database & Server Start ---------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qr-menu';

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
