const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { memoryStore } = require('../models/dataStore');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'student',
      preferredLanguage: user.preferredLanguage || 'English'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, preferredLanguage, phone, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (getIsConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
        preferredLanguage: preferredLanguage || 'English',
        contactDetails: { phone: phone || '', organization: organization || '' }
      });

      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferredLanguage: user.preferredLanguage,
            contactDetails: user.contactDetails,
            notificationPreferences: user.notificationPreferences
          },
          token
        }
      });
    }

    // In-memory fallback
    const existing = memoryStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = memoryStore.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      preferredLanguage: preferredLanguage || 'English',
      contactDetails: { phone: phone || '', organization: organization || '' }
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Registration successful (Running with built-in storage)',
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          preferredLanguage: newUser.preferredLanguage,
          contactDetails: newUser.contactDetails,
          notificationPreferences: newUser.notificationPreferences
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    let user = null;

    if (getIsConnected()) {
      user = await User.findOne({ email });
    } else {
      user = memoryStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
          contactDetails: user.contactDetails,
          notificationPreferences: user.notificationPreferences
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Demo / Guest Instant Login
// @route POST /api/auth/demo
const demoLogin = async (req, res) => {
  try {
    const demoUser = memoryStore.findUserByEmail('student@noticeassistant.edu') || memoryStore.users[0];
    const token = generateToken(demoUser);
    res.status(200).json({
      success: true,
      message: 'Logged in as Demo Student',
      data: {
        user: demoUser,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get current profile
// @route GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Profile & Language Preferences (FR2)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, preferredLanguage, contactDetails, notificationPreferences, mfaEnabled } = req.body;
    const userId = req.user._id;

    if (getIsConnected()) {
      const updated = await User.findByIdAndUpdate(
        userId,
        {
          ...(name && { name }),
          ...(preferredLanguage && { preferredLanguage }),
          ...(contactDetails && { contactDetails }),
          ...(notificationPreferences && { notificationPreferences }),
          ...(typeof mfaEnabled === 'boolean' && { mfaEnabled })
        },
        { new: true }
      ).select('-password');

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated
      });
    }

    const updated = memoryStore.updateUser(userId, {
      ...(name && { name }),
      ...(preferredLanguage && { preferredLanguage }),
      ...(contactDetails && { contactDetails }),
      ...(notificationPreferences && { notificationPreferences }),
      ...(typeof mfaEnabled === 'boolean' && { mfaEnabled })
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getProfile,
  updateProfile
};
