const jwt = require('jsonwebtoken');
const { memoryStore } = require('../models/dataStore');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_pathpilot_notice_assistant_2026';

const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (getIsConnected()) {
      try {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // fallback
      }
    }

    // Fallback store lookup
    const storeUser = memoryStore.findUserById(decoded.id) || memoryStore.findUserByEmail(decoded.email);
    if (!storeUser) {
      // If valid token with payload, attach payload
      req.user = { _id: decoded.id, name: decoded.name || 'User', email: decoded.email, role: decoded.role || 'student' };
      return next();
    }

    req.user = storeUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = memoryStore.findUserById(decoded.id) || { _id: decoded.id, email: decoded.email, name: decoded.name };
    }
  } catch (e) {
    // Ignore invalid optional token
  }
  next();
};

module.exports = { authenticate, optionalAuth, JWT_SECRET };
