const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login',    login);

router.get('/me',
  authenticate,
  (req, res) => res.json({ message: `Logged in as ${req.user.username}`, user: req.user })
);

router.get('/admin-only',
  authenticate,
  requireRole('admin'),
  (req, res) => res.json({ message: 'You are an admin' })
);

module.exports = router;