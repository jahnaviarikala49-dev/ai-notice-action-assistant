const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  notice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notice',
    required: true,
  },
  actionItemText: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deadline: {
    type: String,
    required: true,
  },
  reminderDate: {
    type: Date,
    required: true,
  },
  deliveryChannel: {
    type: String,
    enum: ['in-app', 'email', 'both'],
    default: 'in-app',
  },
  status: {
    type: String,
    enum: ['active', 'snoozed', 'dismissed'],
    default: 'active',
  },
  snoozedCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
