const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Get user profile (protected route)
router.get('/profile', auth, authController.getProfile);

module.exports = router; 