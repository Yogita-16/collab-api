import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { setupSocket } from "./config/socket.js";
import logger from "./config/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",").map((url) => url.trim()) || [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Setup socket events
setupSocket(io);

// Make io accessible to routes
app.set("io", io);

// Start server
async function start() {
  try {
    // Connect to database
    await connectDB();

    // Start HTTP server (not app.listen)
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`✓ Socket.IO ready for real-time updates`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
