const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getReminders, updateReminder } = require('../controllers/analyticsController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/dashboard', optionalAuth, getDashboardMetrics);
router.get('/reminders', optionalAuth, getReminders);
router.patch('/reminders/:id', optionalAuth, updateReminder);

module.exports = router;
