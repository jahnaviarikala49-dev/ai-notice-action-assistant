const { memoryStore } = require('../models/dataStore');
const ChatMessage = require('../models/ChatMessage');
const { Notice } = require('../models/Notice');
const { getIsConnected } = require('../config/db');
const { answerNoticeQuestion } = require('../services/aiProcessor');

// @desc Ask question about notice (FR4, HLD Figure 9)
// @route POST /api/notices/:id/chat
const askQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, language } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Question cannot be empty.' });
    }

    let notice = null;

    if (getIsConnected()) {
      notice = await Notice.findById(id);
    } else {
      notice = memoryStore.getNoticeById(id);
    }

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found.' });
    }

    // Call AI Q&A Engine
    const answer = await answerNoticeQuestion(notice, question, language || 'English');

    if (getIsConnected()) {
      const userMsg = await ChatMessage.create({
        notice: id,
        user: req.user?._id || null,
        role: 'User',
        text: question,
        language: language || 'English'
      });

      const aiMsg = await ChatMessage.create({
        notice: id,
        user: req.user?._id || null,
        role: 'AI',
        text: answer,
        language: language || 'English'
      });

      return res.status(200).json({
        success: true,
        data: {
          question: userMsg,
          answer: aiMsg
        }
      });
    }

    // In-memory fallback
    const userMsg = memoryStore.addChatMessage(id, {
      role: 'User',
      text: question,
      language: language || 'English'
    });

    const aiMsg = memoryStore.addChatMessage(id, {
      role: 'AI',
      text: answer,
      language: language || 'English'
    });

    res.status(200).json({
      success: true,
      data: {
        question: userMsg,
        answer: aiMsg
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get chat messages for notice
// @route GET /api/notices/:id/chat
const getChatHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const messages = await ChatMessage.find({ notice: id }).sort({ createdAt: 1 });
      return res.status(200).json({ success: true, count: messages.length, data: messages });
    }

    const messages = memoryStore.getNoticeChat(id);
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  askQuestion,
  getChatHistory
};
