const { memoryStore } = require('../models/dataStore');
const Draft = require('../models/Draft');
const { Notice } = require('../models/Notice');
const { getIsConnected } = require('../config/db');
const { generateReplyDraft } = require('../services/aiProcessor');

// @desc Generate Draft Reply / Application (FR7)
// @route POST /api/notices/:id/drafts/generate
const generateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { draftType, tone, language } = req.body;

    let notice = null;
    if (getIsConnected()) {
      notice = await Notice.findById(id);
    } else {
      notice = memoryStore.getNoticeById(id);
    }

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found.' });
    }

    const draftResult = await generateReplyDraft({
      notice,
      user: req.user,
      draftType: draftType || 'reply',
      tone: tone || 'formal',
      language: language || 'English'
    });

    res.status(200).json({
      success: true,
      message: 'Draft generated successfully',
      data: draftResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Save Generated or Edited Draft (FR7)
// @route POST /api/notices/:id/drafts
const saveDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, bodyContent, recipient, draftType, tone, language } = req.body;

    if (!subject || !bodyContent) {
      return res.status(400).json({ success: false, message: 'Subject and body content are required.' });
    }

    const draftData = {
      notice: id,
      user: req.user?._id || 'usr_demo_student_01',
      subject,
      bodyContent,
      recipient: recipient || 'Concerned Authority',
      draftType: draftType || 'reply',
      tone: tone || 'formal',
      language: language || 'English'
    };

    if (getIsConnected()) {
      const created = await Draft.create(draftData);
      return res.status(201).json({ success: true, message: 'Draft saved successfully', data: created });
    }

    const created = memoryStore.createDraft(draftData);
    res.status(201).json({ success: true, message: 'Draft saved successfully', data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all drafts for a notice
// @route GET /api/notices/:id/drafts
const getDraftsByNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const drafts = await Draft.find({ notice: id }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: drafts.length, data: drafts });
    }

    const drafts = memoryStore.getDraftsByNotice(id);
    res.status(200).json({ success: true, count: drafts.length, data: drafts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateDraft,
  saveDraft,
  getDraftsByNotice
};
