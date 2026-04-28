/**
 * Verifies JWT for staff (admin / kitchen) routes.
 */

const jwt = require('jsonwebtoken');

function requireStaffAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = auth.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== 'staff') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.staff = payload;
        return next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { requireStaffAuth };
