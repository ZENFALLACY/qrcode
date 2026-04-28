/**
 * Auth Routes
 * POST /api/admin/login — verify admin password (bcrypt), return JWT
 * GET  /api/admin/me   — verify token is still valid
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { requireStaffAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts, try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/admin/login
 * Body: { password: string }
 */
router.post('/admin/login', loginLimiter, async (req, res) => {
    try {
        const { password } = req.body;
        const hash = process.env.ADMIN_PASSWORD_HASH;

        if (!password || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Password required' });
        }

        const ok = await bcrypt.compare(password, hash);
        if (!ok) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
        const token = jwt.sign(
            { role: 'staff', sub: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        return res.json({ success: true, token, expiresIn });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/admin/me
 * Validates Authorization: Bearer <token>
 */
router.get('/admin/me', requireStaffAuth, (req, res) => {
    res.json({ authenticated: true, sub: req.staff.sub });
});

module.exports = router;
