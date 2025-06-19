const express = require('express');
const router = express.Router();

// Get dashboard overview
router.get('/overview', (req, res) => {
  res.json({ message: 'Get dashboard overview endpoint' });
});

// Get dashboard statistics
router.get('/stats', (req, res) => {
  res.json({ message: 'Get dashboard statistics endpoint' });
});

// Get recent activity
router.get('/activity', (req, res) => {
  res.json({ message: 'Get recent activity endpoint' });
});

module.exports = router;

 