/**
 * Menu Routes
 * GET    /api/menu      — fetch all menu items
 * POST   /api/menu      — create a new menu item
 * PUT    /api/menu/:id  — update a menu item
 * DELETE /api/menu/:id  — delete a menu item
 */

const express = require('express');
const router = express.Router();
const {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuController');

router.get('/menu', getMenuItems);
router.post('/menu', createMenuItem);
router.put('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);

module.exports = router;
