const express = require('express');
const router = express.Router();
const { askQuestion, getChatHistory } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/:id/chat', optionalAuth, askQuestion);
router.get('/:id/chat', optionalAuth, getChatHistory);

module.exports = router;
