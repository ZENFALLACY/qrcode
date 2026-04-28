/**
 * seed.js
 * Populates the database with sample menu items.
 * Run: node seed.js
 */

const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
require('dotenv').config();

const MenuItem = require('./models/MenuItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qr-menu';

const sampleItems = [
    // Starters
    { name: 'Garlic Bread', price: 120, category: 'Starters' },
    { name: 'Bruschetta', price: 180, category: 'Starters' },
    { name: 'Spring Rolls', price: 150, category: 'Starters' },

    // Main Course
    { name: 'Margherita Pizza', price: 350, category: 'Main Course' },
    { name: 'Grilled Chicken', price: 420, category: 'Main Course' },
    { name: 'Paneer Tikka Masala', price: 300, category: 'Main Course' },
    { name: 'Pasta Alfredo', price: 280, category: 'Main Course' },

    // Drinks
    { name: 'Fresh Lime Soda', price: 80, category: 'Drinks' },
    { name: 'Mango Lassi', price: 120, category: 'Drinks' },
    { name: 'Cold Coffee', price: 150, category: 'Drinks' },

    // Desserts
    { name: 'Chocolate Brownie', price: 200, category: 'Desserts' },
    { name: 'Gulab Jamun', price: 100, category: 'Desserts' },
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing items
        await MenuItem.deleteMany({});
        console.log('🗑️  Cleared existing menu items');

        // Insert sample items
        await MenuItem.insertMany(sampleItems);
        console.log(`🌱 Seeded ${sampleItems.length} menu items`);

        await mongoose.connection.close();
        console.log('👋 Database connection closed');
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedDB();
