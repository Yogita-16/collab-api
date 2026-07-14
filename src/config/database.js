import mongoose from "mongoose";
import logger from "./logger.js";

export async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not defined in .env");
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info("✓ MongoDB connected successfully");
    logger.info(`Database: ${mongoose.connection.db.databaseName}`);

    return mongoose.connection;
  } catch (error) {
    logger.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}
