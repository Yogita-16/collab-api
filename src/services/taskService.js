import mongoose from "mongoose";
import Task from "../models/Task.js";
import logger from "../config/logger.js";

export class TaskService {
  async getAllTasks(userId) {
    try {
      return await Task.find({ userId })
        .populate([
          { path: "userId", select: "name email" },
          { path: "projectId", select: "name" },
          { path: "assignedTo", select: "name email" },
        ])
        .select("title priority completed dueDate projectId status")
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error("getAllTasks error:", error.message);
      throw new Error(`Failed to get tasks: ${error.message}`);
    }
  }

  async getTaskById(taskId, userId) {
    try {
      const task = await Task.findOne({
        _id: taskId,
        userId,
      }).populate([
        { path: "userId", select: "name email" },
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "name email" },
      ]);

      if (!task) throw new Error("Task not found");
      return task;
    } catch (error) {
      logger.error("getTaskById error:", error.message);
      throw new Error(`Failed to get task: ${error.message}`);
    }
  }

  async createTask(taskData, userId) {
    try {
      const {
        title,
        projectId,
        priority = "medium",
        description = "",
      } = taskData;

      // Validate required fields
      if (!title || !projectId) {
        throw new Error("Title and projectId are required");
      }
      const task = await Task.create({
        ...taskData,
        userId,
        status: "todo",
        completed: false,
        metadata: { createdBy: userId },
      });

      logger.info(`Task created: ${task._id}`);

      // Populate after creation
      await task.populate([
        { path: "userId", select: "name email" },
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "name email" },
      ]);

      return {
        message: "Task created successfully",
        task,
      };
    } catch (error) {
      logger.error("createTask error:", error.message);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async updateTask(taskId, userId, updates) {
    try {
      logger.info(`Updating task ${taskId} with:`, updates);
      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        {
          $set: {
            ...updates,
            "metadata.updatedBy": userId,
          },
        },
        { new: true, runValidators: true },
      ).populate([
        { path: "userId", select: "name email" },
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "name email" },
      ]);

      if (!task) throw new Error("Task not found");
      logger.info(`Task updated: ${taskId}`);
      return {
        message: "Task updated successfully",
        task,
      };
    } catch (error) {
      logger.error("updateTask error:", error.message);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async deleteTask(taskId, userId) {
    try {
      const result = await Task.findOneAndDelete({
        _id: taskId,
        userId,
      });

      if (!result) throw new Error("Task not found");
      logger.info(`Task deleted: ${taskId}`);
      return true;
    } catch (error) {
      logger.error("deleteTask error:", error.message);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async getCompletedTasks(userId) {
    try {
      return await Task.find({ userId, completed: true })
        .populate([
          { path: "userId", select: "name email" },
          { path: "projectId", select: "name" },
          { path: "assignedTo", select: "name email" },
        ])
        .select("title priority dueDate projectId")
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error("getCompletedTasks error:", error.message);
      throw new Error(`Failed to get completed tasks: ${error.message}`);
    }
  }

  async getPendingTasks(userId) {
    try {
      return await Task.find({ userId, completed: false })
        .populate([
          { path: "userId", select: "name email" },
          { path: "projectId", select: "name" },
          { path: "assignedTo", select: "name email" },
        ])
        .select("title priority dueDate projectId")
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error("getPendingTasks error:", error.message);
      throw new Error(`Failed to get pending tasks: ${error.message}`);
    }
  }

  async searchTasks(userId, query) {
    try {
      return await Task.find({
        userId,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      }).populate([
        { path: "userId", select: "name email" },
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "name email" },
      ]);
    } catch (error) {
      logger.error("searchTasks error:", error.message);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async getStatistics(userId) {
    try {
      const total = await Task.countDocuments({ userId });
      const completed = await Task.countDocuments({
        userId,
        completed: true,
      });

      return {
        total,
        completed,
        pending: total - completed,
        completionPercentage:
          total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    } catch (error) {
      logger.error("getStatistics error:", error.message);
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  async getTasksPaginated(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const tasks = await Task.find({ userId })
        .populate([
          { path: "userId", select: "name email" },
          { path: "projectId", select: "name" },
          { path: "assignedTo", select: "name email" },
        ])
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Task.countDocuments({ userId });

      return {
        data: tasks,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("getTasksPaginated error:", error.message);
      throw new Error(`Failed to get paginated tasks: ${error.message}`);
    }
  }

  async addComment(taskId, userId, text) {
    try {
      if (!text || text.trim() === "") {
        throw new Error("Comment text is required");
      }

      const task = await Task.findByIdAndUpdate(
        taskId,
        {
          $push: {
            comments: {
              _id: new mongoose.Types.ObjectId(),
              userId,
              text,
              createdAt: new Date(),
            },
          },
        },
        { new: true },
      ).populate([
        { path: "userId", select: "name email" },
        { path: "comments.userId", select: "name email" },
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "name email" },
      ]);

      if (!task) throw new Error("Task not found");
      logger.info(`Comment added to task: ${taskId}`);
      return task;
    } catch (error) {
      logger.error("addComment error:", error.message);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  async addSubtask(taskId, title) {
    try {
      if (!title || title.trim() === "") {
        throw new Error("Subtask title is required");
      }

      const task = await Task.findByIdAndUpdate(
        taskId,
        {
          $push: {
            subtasks: {
              _id: new mongoose.Types.ObjectId(),
              title,
              completed: false,
            },
          },
        },
        { new: true },
      ).populate([
        { path: "userId", select: "name email" },
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "name email" },
      ]);

      if (!task) throw new Error("Task not found");
      logger.info(`Subtask added to task: ${taskId}`);
      return task;
    } catch (error) {
      logger.error("addSubtask error:", error.message);
      throw new Error(`Failed to add subtask: ${error.message}`);
    }
  }

  async assignTask(taskId, userId, assignToUserId) {
    try {
      if (!assignToUserId) {
        throw new Error("User ID is required for assignment");
      }

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { assignedTo: assignToUserId },
        { new: true },
      ).populate([
        { path: "userId", select: "name email" },
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "name email" },
      ]);

      if (!task) throw new Error("Task not found");
      logger.info(`Task assigned: ${taskId} to ${assignToUserId}`);
      return task;
    } catch (error) {
      logger.error("assignTask error:", error.message);
      throw new Error(`Failed to assign task: ${error.message}`);
    }
  }
}
