const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', authenticateToken, authController.getProfile);

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', authenticateToken, authController.updateProfile);

// PUT /api/auth/change-password - Change password (protected)
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
