const mongoose = require('mongoose');

const ActionItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  deadline: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending',
  },
  documentRequired: {
    type: String,
    default: '',
  },
  snoozedUntil: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

const NoticeSchema = new mongoose.Schema({
  notice_id: {
    type: String,
    default: () => 'NTC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  sender: {
    type: String,
    default: 'Official Authority',
  },
  originalText: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'English',
  },
  summary: {
    plainSummary: { type: String, default: '' },
    purpose: { type: String, default: '' },
    keyPoints: [{ type: String }],
    consequences: { type: String, default: '' },
    summaryHindi: { type: String, default: '' },
    summaryTelugu: { type: String, default: '' },
  },
  actions: [ActionItemSchema],
  deadlines: [{
    title: String,
    date: String,
    time: String,
    isUrgent: Boolean,
  }],
  documents_required: [{
    name: String,
    mandatory: Boolean,
    notes: String,
  }],
  eligibility: [{ type: String }],
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending',
  },
  sourceType: {
    type: String,
    enum: ['pasted_text', 'pdf_upload', 'image_upload'],
    default: 'pasted_text',
  },
  fileName: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = {
  Notice: mongoose.model('Notice', NoticeSchema),
  NoticeSchema,
  ActionItemSchema
};
