/**
 * Order Model
 * Represents a customer order placed from a specific table.
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
    },
    items: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, default: 1 },
        },
    ],
    orderTime: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    scheduledTime: {
        type: Date,
        required: [true, 'Scheduled time is required for this order'],
    },
});

module.exports = mongoose.model('Order', orderSchema);
