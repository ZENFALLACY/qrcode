/**
 * Menu Routes
 * GET    /api/menu      — fetch all menu items (public)
 * POST   /api/menu      — create (staff)
 * PUT    /api/menu/:id  — update (staff)
 * DELETE /api/menu/:id  — delete (staff)
 */

const express = require('express');
const router = express.Router();
const { requireStaffAuth } = require('../middleware/authMiddleware');
const {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuController');

router.get('/menu', getMenuItems);
router.post('/menu', requireStaffAuth, createMenuItem);
router.put('/menu/:id', requireStaffAuth, updateMenuItem);
router.delete('/menu/:id', requireStaffAuth, deleteMenuItem);

module.exports = router;
