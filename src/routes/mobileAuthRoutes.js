const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mobileAuthController = require('../controllers/mobileAuthController');

// Middleware to authenticate citizen tokens (different from user tokens)
const authenticateCitizenToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Check if this is a citizen token
    if (decoded.type !== 'citizen') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    req.user = decoded; // { citizenId, email, phone, type: 'citizen' }
    next();
  });
};

// POST /api/mobile-auth/register - Register new citizen
router.post('/register', mobileAuthController.register);

// POST /api/mobile-auth/login - Login citizen
router.post('/login', mobileAuthController.login);

// POST /api/mobile-auth/reset-password - Reset password (debug endpoint)
router.post('/reset-password', mobileAuthController.resetPassword);

// GET /api/mobile-auth/profile - Get current citizen profile (protected)
router.get('/profile', authenticateCitizenToken, mobileAuthController.getProfile);

// PUT /api/mobile-auth/profile - Update citizen profile (protected)
router.put('/profile', authenticateCitizenToken, mobileAuthController.updateProfile);

// PUT /api/mobile-auth/change-password - Change password (protected)
router.put('/change-password', authenticateCitizenToken, mobileAuthController.changePassword);

module.exports = router;
