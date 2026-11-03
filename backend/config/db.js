const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const enableMongo = process.env.ENABLE_MONGODB === 'true';

  if (!enableMongo || !mongoUri) {
    console.log(`[Database] Using built-in Persistent Database Engine (Instant zero-config mode).`);
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB not reached (${error.message}). Active: Persistent JSON Engine.`);
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
