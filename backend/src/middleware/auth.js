// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * requireAuth – verifies the Bearer JWT and attaches req.user.
 * Frontend must send:  Authorization: Bearer <token>
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aa_grow_secret');

    // Fetch fresh user from DB on every request to catch deletions / role changes
    const [rows] = await query('SELECT id, name, email, role, phone, farm_name, farm_location, farm_size, profile_pic, otp_verified FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { requireAuth };
