import { TaskService } from "../services/taskService.js";
import logger from "../config/logger.js";

const taskService = new TaskService();

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    logger.info(`[CONTROLLER] POST /api/tasks`);
    logger.info(`[CONTROLLER] User: ${req.user.id}`);

    const task = await taskService.createTask(req.body, req.user.id);

    // Emit socket event
    const io = req.app.get("io");
    io.to(`project-${req.body.projectId}`).emit("taskCreated", {
      taskId: task._id,
      projectId: req.body.projectId,
      task,
    });

    logger.info(`[CONTROLLER] ✅ Task created successfully`);
    res.status(201).json(task);
  } catch (error) {
    logger.error(`[CONTROLLER] ❌ Create error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const updateTask = async (req, res, next) => {
  try {
    logger.info(`[CONTROLLER] PUT /api/tasks/${req.params.id}`);
    logger.info(`[CONTROLLER] User: ${req.user.id}`);
    logger.info(`[CONTROLLER] Body:`, req.body);

    if (!req.params.id) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const task = await taskService.updateTask(
      req.params.id,
      req.user.id,
      req.body,
    );
    // Emit socket event
    const io = req.app.get("io");
    io.to(`project-${task.projectId}`).emit("taskUpdated", {
      taskId: task._id,
      projectId: task.projectId,
      task,
    });

    logger.info(`[CONTROLLER] ✅ Task updated successfully`);
    res.json(task);
  } catch (error) {
    logger.error(`[CONTROLLER] ❌ Update error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    logger.info(`[CONTROLLER] DELETE /api/tasks/${req.params.id}`);

    // Get task first to know project ID
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    await taskService.deleteTask(req.params.id, req.user.id);
    // Emit socket event
    const io = req.app.get("io");
    io.to(`project-${task.projectId}`).emit("taskDeleted", {
      taskId: req.params.id,
      projectId: task.projectId,
    });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCompletedTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getCompletedTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getPendingTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getPendingTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const searchTasks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Query required" });
    }
    const tasks = await taskService.searchTasks(req.user.id, q);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await taskService.getStatistics(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getTasksPaginated = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await taskService.getTasksPaginated(
      req.user.id,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await taskService.addComment(req.params.id, req.user.id, text);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    const task = await taskService.addSubtask(req.params.id, title);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const assignTask = async (req, res, next) => {
  try {
    const { assignToUserId } = req.body;
    const task = await taskService.assignTask(
      req.params.id,
      req.user.id,
      assignToUserId,
    );
    res.json(task);
  } catch (error) {
    next(error);
  }
};
