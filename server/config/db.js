const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.trim() === '') {
    console.log('ℹ️  No MONGO_URI provided in .env. Running with built-in in-memory / local JSON store fallback.');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    isConnected = true;
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed (${error.message}). Falling back to built-in in-memory storage seamlessly.`);
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
