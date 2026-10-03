const { memoryStore } = require('../models/dataStore');
const { Notice } = require('../models/Notice');
const { getIsConnected } = require('../config/db');
const { analyzeNoticeText } = require('../services/aiProcessor');

// @desc Create and Analyze Notice (FR3, FR4, FR5)
// @route POST /api/notices
const createNotice = async (req, res) => {
  try {
    let { title, content, sourceType } = req.body;
    let fileName = null;

    if (req.file) {
      fileName = req.file.originalname;
      sourceType = req.file.mimetype.includes('pdf') ? 'pdf_upload' : 'image_upload';
      if (!content) {
        // Simulated OCR text extraction from document
        content = `OFFICIAL NOTICE: ${fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}\n` +
          `Ref: ADM/2026/DOC\nDate: ${new Date().toLocaleDateString()}\n\n` +
          `Subject: Important Guidelines and Compliance Instructions\n\n` +
          `Notice content extracted via OCR engine from ${fileName}. Mandatory submission of relevant verification receipts and student identity documents before deadline. High priority review requested.`;
      }
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notice text content or document file is required.'
      });
    }

    // Run AI Analysis & Extraction
    const analysis = await analyzeNoticeText(content, title);

    const noticePayload = {
      title: title || analysis.title,
      sender: analysis.sender,
      originalText: content,
      language: analysis.language,
      summary: analysis.summary,
      actions: analysis.actions,
      deadlines: analysis.deadlines,
      documents_required: analysis.documents_required,
      eligibility: analysis.eligibility,
      priority: analysis.priority,
      status: 'Pending',
      sourceType: sourceType || 'pasted_text',
      fileName: fileName,
      user: req.user?._id || 'usr_demo_student_01'
    };

    if (getIsConnected()) {
      const created = await Notice.create(noticePayload);
      return res.status(201).json({
        success: true,
        message: 'Notice analyzed and saved successfully',
        data: created
      });
    }

    // In-memory fallback
    const created = memoryStore.createNotice(noticePayload);
    return res.status(201).json({
      success: true,
      message: 'Notice analyzed and saved successfully',
      data: created
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get All Notices (FR8)
// @route GET /api/notices
const getAllNotices = async (req, res) => {
  try {
    const { priority, status, search } = req.query;

    if (getIsConnected()) {
      let query = {};
      if (priority) query.priority = priority;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { sender: { $regex: search, $options: 'i' } }
        ];
      }

      const notices = await Notice.find(query).sort({ created_at: -1 });
      return res.status(200).json({
        success: true,
        count: notices.length,
        data: notices
      });
    }

    let notices = memoryStore.getAllNotices();
    if (priority) notices = notices.filter(n => n.priority.toLowerCase() === priority.toLowerCase());
    if (status) notices = notices.filter(n => n.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const s = search.toLowerCase();
      notices = notices.filter(n => n.title.toLowerCase().includes(s) || n.sender.toLowerCase().includes(s));
    }

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Single Notice by ID
// @route GET /api/notices/:id
const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const notice = await Notice.findById(id);
      if (!notice) {
        return res.status(404).json({ success: false, message: 'Notice not found.' });
      }
      return res.status(200).json({ success: true, data: notice });
    }

    const notice = memoryStore.getNoticeById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found.' });
    }

    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Notice details
// @route PUT /api/notices/:id
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getIsConnected()) {
      const updated = await Notice.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Notice not found.' });
      return res.status(200).json({ success: true, data: updated });
    }

    const updated = memoryStore.updateNotice(id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Notice not found.' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Notice
// @route DELETE /api/notices/:id
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const deleted = await Notice.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Notice not found.' });
      return res.status(200).json({ success: true, message: 'Notice deleted successfully' });
    }

    const deleted = memoryStore.deleteNotice(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Notice not found.' });
    res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle Action Item status (FR5, Figure 8 HLD)
// @route PATCH /api/notices/:id/actions/:actionId
const toggleActionItem = async (req, res) => {
  try {
    const { id, actionId } = req.params;

    if (getIsConnected()) {
      const notice = await Notice.findById(id);
      if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });

      const action = notice.actions.id(actionId);
      if (!action) return res.status(404).json({ success: false, message: 'Action item not found.' });

      action.status = action.status === 'Completed' ? 'Pending' : 'Completed';
      
      const allDone = notice.actions.every(a => a.status === 'Completed');
      const anyDone = notice.actions.some(a => a.status === 'Completed');
      notice.status = allDone ? 'Completed' : (anyDone ? 'In Progress' : 'Pending');

      await notice.save();
      return res.status(200).json({ success: true, data: { notice, action } });
    }

    const result = memoryStore.toggleActionItem(id, actionId);
    if (!result) return res.status(404).json({ success: false, message: 'Notice or action item not found.' });

    res.status(200).json({
      success: true,
      message: `Action marked as ${result.action.status}`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add custom Action Item to notice (FR5)
// @route POST /api/notices/:id/actions
const addActionItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, deadline, priority, documentRequired, notes } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Action text is required.' });
    }

    const actionData = {
      text,
      deadline: deadline || 'As per circular',
      priority: priority || 'Medium',
      documentRequired: documentRequired || '',
      notes: notes || ''
    };

    if (getIsConnected()) {
      const notice = await Notice.findById(id);
      if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
      notice.actions.push(actionData);
      await notice.save();
      return res.status(201).json({ success: true, data: { notice, action: notice.actions[notice.actions.length - 1] } });
    }

    const result = memoryStore.addActionItem(id, actionData);
    if (!result) return res.status(404).json({ success: false, message: 'Notice not found.' });

    res.status(201).json({
      success: true,
      message: 'Action item added',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Action Item from notice (FR5)
// @route DELETE /api/notices/:id/actions/:actionId
const deleteActionItem = async (req, res) => {
  try {
    const { id, actionId } = req.params;

    if (getIsConnected()) {
      const notice = await Notice.findById(id);
      if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
      notice.actions.pull(actionId);
      await notice.save();
      return res.status(200).json({ success: true, message: 'Action item removed', data: notice });
    }

    const notice = memoryStore.deleteActionItem(id, actionId);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });

    res.status(200).json({ success: true, message: 'Action item removed', data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  toggleActionItem,
  addActionItem,
  deleteActionItem
};
