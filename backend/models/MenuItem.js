/**
 * MenuItem Model
 * Represents a single item on the restaurant menu.
 */

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Item price is required'],
        min: 0,
    },
    category: {
        type: String,
        required: [true, 'Item category is required'],
        trim: true,
    },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
