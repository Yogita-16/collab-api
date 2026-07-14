import express from "express";
import * as taskController from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateTask,
  validateComment,
  validateSubtask,
} from "../middleware/validation.js";
import logger from "../config/logger.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Logging middleware
router.use((req, res, next) => {
  logger.info(`[ROUTES] ${req.method} ${req.path}`);
  next();
});

// GET routes (no validation needed)
router.get("/", taskController.getAllTasks);
router.get("/stats", taskController.getStatistics);
router.get("/filter/completed", taskController.getCompletedTasks);
router.get("/filter/pending", taskController.getPendingTasks);
router.get("/search", taskController.searchTasks);
router.get("/paginated", taskController.getTasksPaginated);
router.get("/:id", taskController.getTaskById);

// POST routes (validate)
router.post("/", validateTask, taskController.createTask);
router.post("/:id/comments", validateComment, taskController.addComment);
router.post("/:id/subtasks", validateSubtask, taskController.addSubtask);
router.post("/:id/assign", taskController.assignTask);

// PUT routes (validate but allow partial)
router.put("/:id", validateTask, taskController.updateTask);

// DELETE routes
router.delete("/:id", taskController.deleteTask);

export default router;
