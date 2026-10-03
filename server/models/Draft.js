const mongoose = require('mongoose');

const DraftSchema = new mongoose.Schema({
  notice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notice',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  draftType: {
    type: String,
    enum: ['reply', 'application', 'request_letter', 'clarification'],
    default: 'reply',
  },
  tone: {
    type: String,
    enum: ['formal', 'polite', 'urgent'],
    default: 'formal',
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Telugu'],
    default: 'English',
  },
  subject: {
    type: String,
    required: true,
  },
  bodyContent: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    default: 'Concerned Authority',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Draft', DraftSchema);
