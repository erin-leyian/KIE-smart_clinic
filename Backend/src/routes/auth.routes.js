const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/auth.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// Public endpoints
router.post('/register', register);
router.post('/login', login);

// Protected endpoints
router.get('/me', authenticate, getCurrentUser);

// User management endpoints (admin required for some)
router.get('/users', authenticate, requireRole('admin'), getAllUsers);
router.get('/users/:id', authenticate, getUserById);
router.put('/users/:id', authenticate, updateUser);
router.delete('/users/:id', authenticate, deleteUser);

module.exports = router;