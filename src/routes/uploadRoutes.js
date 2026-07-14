import express from "express";
import { upload } from "../config/fileUpload.js";
import * as uploadController from "../controllers/uploadController.js";
import { authenticate } from "../middleware/auth.js";
import logger from "../config/logger.js";
const router = express.Router();

router.use(authenticate);
// Logging middleware
router.use((req, res, next) => {
  logger.info(`[ROUTES] ${req.method} /api/uploads${req.path}`);
  next();
});

// Upload file to task
router.post("/:taskId", upload.single("file"), uploadController.uploadFile);

// Get all attachments for a task
router.get("/:taskId", uploadController.getTaskAttachments);

// Download file
router.get("/:taskId/:attachmentId/download", uploadController.downloadFile);

router.delete("/:taskId/:attachmentId", uploadController.deleteAttachment);

export default router;
