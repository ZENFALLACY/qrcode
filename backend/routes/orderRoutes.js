/**
 * Order Routes
 * POST /api/order  — place a new order
 * GET  /api/status — check if ordering is open
 */

const express = require('express');
const router = express.Router();
const { createOrder, getStatus, getOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/order', createOrder);
router.get('/status', getStatus);
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
