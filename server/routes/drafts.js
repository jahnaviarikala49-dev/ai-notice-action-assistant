const express = require('express');
const router = express.Router();
const { generateDraft, saveDraft, getDraftsByNotice } = require('../controllers/draftController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/:id/drafts/generate', optionalAuth, generateDraft);
router.post('/:id/drafts', optionalAuth, saveDraft);
router.get('/:id/drafts', optionalAuth, getDraftsByNotice);

module.exports = router;
