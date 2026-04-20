/**
 * Auth Routes
 * POST /api/admin/login — verify admin password
 */

const express = require('express');
const router = express.Router();

/**
 * POST /api/admin/login
 * Body: { password: string }
 * Returns { success: true } if password matches, 401 otherwise.
 */
router.post('/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
        return res.json({ success: true, message: 'Access granted' });
    }

    res.status(401).json({ success: false, message: 'Incorrect password' });
});

module.exports = router;
