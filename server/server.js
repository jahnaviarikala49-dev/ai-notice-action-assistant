require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getIsConnected } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const noticeRoutes = require('./routes/notices');
const chatRoutes = require('./routes/chat');
const draftRoutes = require('./routes/drafts');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas (with automatic fallback to in-memory store)
connectDB();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Notice Action Assistant Backend is operating normally',
    database: getIsConnected() ? 'MongoDB Atlas (Connected)' : 'Built-in In-Memory / Local Store (Active)',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/notices', chatRoutes);
app.use('/api/notices', draftRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📚 Storage Engine: ${getIsConnected() ? 'MongoDB Atlas' : 'In-Memory Fallback'}`);
});
