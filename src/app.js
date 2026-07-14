import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./config/logger.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import docsRoutes from "./routes/docsRoutes.js";

// Middleware
import { requestLogger } from "./middleware/logging.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalLimiter, apiLimiter } from "./middleware/rateLimit.js";
import { slowQueryMonitor } from "./middleware/monitoring.js";

dotenv.config();

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ============================================
// STATIC FILES
// ============================================
app.use("/uploads", express.static("uploads"));

// ============================================
// LOGGING & MONITORING
// ============================================
app.use(requestLogger);
app.use(slowQueryMonitor(1000)); // Log queries > 1 second

// ============================================
// RATE LIMITING
// ============================================
app.use(generalLimiter);
app.use("/api/", apiLimiter);

// ============================================
// HEALTH CHECK
// ============================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================
// API ROUTES
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/docs", docsRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// ============================================
// ERROR HANDLING (MUST BE LAST)
// ============================================

app.use(errorHandler);

export default app;
