/**
 * Order Routes
 * POST /api/order                    — place a new order (public)
 * GET  /api/status                    — ordering window (public)
 * GET  /api/orders                    — kitchen (staff)
 * PATCH /api/orders/:id/status        — kitchen (staff)
 */

const express = require('express');
const router = express.Router();
const { requireStaffAuth } = require('../middleware/authMiddleware');
const { createOrder, getStatus, getOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/order', createOrder);
router.get('/status', getStatus);
router.get('/orders', requireStaffAuth, getOrders);
router.patch('/orders/:id/status', requireStaffAuth, updateOrderStatus);

module.exports = router;
