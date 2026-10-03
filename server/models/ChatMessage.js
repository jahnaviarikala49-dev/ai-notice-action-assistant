const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['User', 'AI'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'English',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
