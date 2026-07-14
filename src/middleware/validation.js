import { body, validationResult } from "express-validator";
import logger from "../config/logger.js";

// ========================================
// TASK VALIDATION
// ========================================
export const validateTask = [
  // For POST (create): title is required
  // For PUT (update): title is optional
  body("title")
    .optional({ checkFalsy: false }) // Only validate if provided
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title too long"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description too long"),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be boolean"),

  body("status")
    .optional()
    .isIn(["todo", "in-progress", "review", "done"])
    .withMessage("Invalid status"),

  body("dueDate").optional().isISO8601().withMessage("Invalid due date format"),

  body("projectId").optional().isMongoId().withMessage("Invalid project ID"),

  body("assignedTo").optional().isMongoId().withMessage("Invalid user ID"),

  // Custom middleware to handle errors
  (req, res, next) => {
    const errors = validationResult(req);

    // For POST requests, require title
    if (req.method === "POST" && !req.body.title) {
      logger.warn("[VALIDATION] POST request missing title");
      return res.status(400).json({
        error: "Title is required",
        errors: errors.array(),
      });
    }

    // For PUT requests, allow any field
    if (req.method === "PUT") {
      logger.info("[VALIDATION] PUT request - allowing partial update");
      return next();
    }

    // For POST, if other validation errors exist
    if (!errors.isEmpty()) {
      logger.warn("[VALIDATION] Task validation errors:", errors.array());
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    next();
  },
];

// ========================================
// USER VALIDATION
// ========================================
export const validateUser = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name too long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("[VALIDATION] User validation errors:", errors.array());
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

// ========================================
// PROJECT VALIDATION
// ========================================
export const validateProject = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ max: 100 })
    .withMessage("Project name too long"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description too long"),

  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Invalid color format (use #RRGGBB)"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("[VALIDATION] Project validation errors:", errors.array());
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

// ========================================
// COMMENT VALIDATION
// ========================================
export const validateComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("[VALIDATION] Comment validation errors:", errors.array());
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

// ========================================
// SUBTASK VALIDATION
// ========================================
export const validateSubtask = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Subtask title is required")
    .isLength({ max: 200 })
    .withMessage("Subtask title too long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("[VALIDATION] Subtask validation errors:", errors.array());
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];
