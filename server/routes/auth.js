const express = require('express');
const router = express.Router();
const { register, login, demoLogin, getProfile, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/demo', demoLogin);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
