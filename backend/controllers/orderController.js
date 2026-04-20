/**
 * Order Controller
 * Handles order creation and ordering-status checks.
 */

const Order = require('../models/Order');

// Cutoff hour (24-hour format). Ordering is disabled at or after this hour.
const ORDERING_CUTOFF_HOUR = 17; // 5 PM

/**
 * Helper: checks whether ordering is currently allowed.
 * Returns { ordering: boolean, message: string }.
 */
const checkOrderingStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 22 || currentHour < 6) {
        return {
            ordering: false,
            message: 'The portal is closed between 10:00 PM and 6:00 AM.',
        };
    }

    return {
        ordering: true,
        message: 'Ordering is open',
    };
};

/**
 * GET /api/status
 * Returns whether ordering is currently allowed.
 */
const getStatus = (_req, res) => {
    const status = checkOrderingStatus();
    res.json(status);
};

/**
 * POST /api/order
 * Creates a new order if ordering is still open.
 * Body: { tableNumber: Number, items: [{ name, price, quantity }] }
 */
const createOrder = async (req, res) => {
    try {
        // Check if ordering is allowed
        const status = checkOrderingStatus();
        if (!status.ordering) {
            return res.status(403).json({
                error: status.message,
            });
        }

        const { tableNumber, items, scheduledTime } = req.body;

        // Basic validation
        if (!tableNumber || !items || items.length === 0) {
            return res.status(400).json({
                error: 'Table number and at least one item are required',
            });
        }

        if (!scheduledTime) {
            return res.status(400).json({ error: 'Scheduled delivery time is required' });
        }

        const scheduledDate = new Date(scheduledTime);
        const minDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours from now

        if (scheduledDate < minDate) {
            return res.status(400).json({
                error: 'Orders must be scheduled at least 4 hours in advance'
            });
        }

        const order = await Order.create({
            tableNumber,
            items,
            scheduledTime: scheduledDate,
            orderTime: new Date(),
        });

        console.log(`📝 New order from Table ${tableNumber}:`, items.map((i) => i.name).join(', '));

        res.status(201).json({
            message: 'Order placed successfully!',
            order,
        });
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ error: 'Failed to place order' });
    }
};

/**
 * GET /api/orders
 * Admin: Fetch all pending orders, sorted by oldest first.
 */
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' }).sort({ orderTime: 1 });
        res.json(orders);
    } catch (err) {
        console.error('Failed to fetch orders:', err.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

/**
 * PATCH /api/orders/:id/status
 * Admin: Update order status (e.g., mark as 'completed').
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        console.error('Failed to update order status:', err.message);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

module.exports = { getStatus, createOrder, getOrders, updateOrderStatus };
