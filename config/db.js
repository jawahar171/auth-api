// ─────────────────────────────────────────────
//  config/db.js  –  MongoDB Connection
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

/**
 * connectDB
 * Establishes a connection to MongoDB using the URI in .env
 * Exits the process on failure so we don't run a broken server.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;