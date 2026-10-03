const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'citizen', 'employee', 'admin'],
    default: 'student',
  },
  preferredLanguage: {
    type: String,
    enum: ['English', 'Hindi', 'Telugu', 'en', 'hi', 'te'],
    default: 'English',
  },
  contactDetails: {
    phone: { type: String, default: '' },
    organization: { type: String, default: 'University / Institute' },
  },
  notificationPreferences: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    reminderDaysBefore: { type: Number, default: 2 },
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
