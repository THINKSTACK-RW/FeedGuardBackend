const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, adminOnly } = require('../middleware/auth');

// Public routes (if any)
// None - all user operations require authentication

// Protected routes
router.use(authenticateToken); // All user routes require authentication

// GET /api/users - Get all users (admin only)
router.get('/', adminOnly, userController.getAllUsers);

// GET /api/users/:id - Get user by ID (admin only or own profile)
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user (admin only)
router.post('/', adminOnly, userController.createUser);

// PUT /api/users/:id - Update user (admin only or own profile)
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', adminOnly, userController.deleteUser);

module.exports = router;
