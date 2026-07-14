import Task from "../models/Task.js";
import logger from "../config/logger.js";
import fs from "fs";
import path from "path";

// Upload file to task
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { taskId } = req.params;
    logger.info(`[UPLOAD] Uploading to task: ${taskId}`);
    logger.info(
      `[UPLOAD] File: ${req.file.originalname}, Size: ${req.file.size}`,
    );

    // Find task and verify ownership
    const task = await Task.findOne({ _id: taskId, userId: req.user.id });

    if (!task) {
      fs.unlinkSync(req.file.path);
      logger.error(`[UPLOAD] Task not found: ${taskId}`);
      return res.status(404).json({ error: "Task not found" });
    }

    logger.info(
      `[UPLOAD] Task found, current attachments: ${task.attachments.length}`,
    );

    // Create attachment object - DO NOT add _id, Mongoose will auto-generate it
    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    };

    logger.info(`[UPLOAD] Pushing attachment to task`);

    // Push to attachments array - Mongoose will auto-generate _id
    task.attachments.push(attachment);
    const savedTask = await task.save();

    logger.info(
      `[UPLOAD] File saved, total attachments: ${savedTask.attachments.length}`,
    );

    // Get the newly added attachment
    const savedAttachment =
      savedTask.attachments[savedTask.attachments.length - 1];

    logger.info(`[UPLOAD] Saved attachment with ID: ${savedAttachment._id}`);
    logger.info(
      `[UPLOAD] Attachment: { _id: "${savedAttachment._id}", filename: "${savedAttachment.filename}" }`,
    );

    // Populate before sending
    await savedTask.populate([
      { path: "userId", select: "name email" },
      { path: "projectId", select: "name" },
    ]);

    logger.info(`[UPLOAD] Response sent successfully`);

    res.status(201).json({
      message: "File uploaded successfully",
      attachment: savedAttachment,
      task: savedTask,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        logger.error("[UPLOAD] Failed to delete file on error:", unlinkError);
      }
    }
    logger.error(`[UPLOAD] File upload error: ${error.message}`);
    logger.error(`[UPLOAD] Stack: ${error.stack}`);
    res.status(400).json({ error: error.message });
  }
};

// Delete attachment from task
export const deleteAttachment = async (req, res, next) => {
  try {
    const { taskId, attachmentId } = req.params;

    logger.info(
      `[DELETE] Deleting attachment ${attachmentId} from task ${taskId}`,
    );

    // Find task and verify ownership
    const task = await Task.findOne({ _id: taskId, userId: req.user.id });

    if (!task) {
      logger.error(`[DELETE] Task not found: ${taskId}`);
      return res.status(404).json({ error: "Task not found" });
    }

    // Find attachment by ID
    const attachment = task.attachments.id(attachmentId);

    if (!attachment) {
      logger.error(`[DELETE] Attachment not found: ${attachmentId}`);
      logger.error(
        `[DELETE] Available IDs: ${task.attachments.map((a) => a._id).join(", ")}`,
      );
      return res.status(404).json({ error: "Attachment not found" });
    }

    logger.info(`[DELETE] Found attachment: ${attachment.filename}`);

    // Delete physical file from disk
    const filePath = path.join(process.cwd(), "uploads", attachment.filename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`[DELETE] Physical file deleted: ${attachment.filename}`);
      } catch (unlinkError) {
        logger.error(
          `[DELETE] Failed to delete file from disk: ${unlinkError.message}`,
        );
      }
    }

    // Remove attachment from task
    task.attachments.id(attachmentId).deleteOne();
    await task.save();

    logger.info(`[DELETE] Attachment deleted: ${attachment.originalName}`);

    res.json({
      message: "Attachment deleted successfully",
      task,
    });
  } catch (error) {
    logger.error(`[DELETE] Error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Download attachment
export const downloadFile = async (req, res, next) => {
  try {
    const { taskId, attachmentId } = req.params;

    logger.info(
      `[DOWNLOAD] Downloading attachment ${attachmentId} from task ${taskId}`,
    );

    // Find task and verify ownership
    const task = await Task.findOne({ _id: taskId, userId: req.user.id });

    if (!task) {
      logger.error(`[DOWNLOAD] Task not found: ${taskId}`);
      return res.status(404).json({ error: "Task not found" });
    }

    // Find attachment by ID
    const attachment = task.attachments.id(attachmentId);

    if (!attachment) {
      logger.error(`[DOWNLOAD] Attachment not found: ${attachmentId}`);
      logger.error(
        `[DOWNLOAD] Available IDs: ${task.attachments.map((a) => a._id).join(", ")}`,
      );
      return res.status(404).json({ error: "Attachment not found" });
    }

    logger.info(`[DOWNLOAD] Found attachment: ${attachment.filename}`);

    // Check if file exists on disk
    const filePath = path.join(process.cwd(), "uploads", attachment.filename);

    if (!fs.existsSync(filePath)) {
      logger.error(`[DOWNLOAD] File not found on disk: ${filePath}`);
      return res.status(404).json({ error: "File not found on disk" });
    }

    logger.info(`[DOWNLOAD] Sending file: ${attachment.originalName}`);
    res.download(filePath, attachment.originalName);
  } catch (error) {
    logger.error(`[DOWNLOAD] Error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get all attachments for a task
export const getTaskAttachments = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({ _id: taskId, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    logger.info(
      `[GET] Retrieved ${task.attachments.length} attachments for task ${taskId}`,
    );

    res.json({
      taskId,
      attachments: task.attachments,
      total: task.attachments.length,
    });
  } catch (error) {
    logger.error(`[GET] Error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};
