import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import logger from "../config/logger.js";
import mongoose from "mongoose";

export class ProjectService {
  async createProject(projectData, userId) {
    try {
      const project = await Project.create({
        ...projectData,
        userId,
        members: [{ userId, role: "owner" }],
      });

      logger.info(`Project created: ${project._id}`);
      return project;
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async getUserProjects(userId) {
    try {
      const projects = await Project.find({
        $or: [{ userId }, { "members.userId": userId }],
        archived: false,
      })
        .populate("userId", "name email")
        .populate("members.userId", "name email")
        .sort({ createdAt: -1 });

      return projects;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  async getProjectById(projectId, userId) {
    try {
      const project = await Project.findOne({
        _id: projectId,
        $or: [{ userId }, { "members.userId": userId }],
      })
        .populate("userId", "name email")
        .populate("members.userId", "name email");

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    } catch (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  async updateProject(projectId, userId, updates) {
    try {
      const project = await Project.findOne({
        _id: projectId,
        userId,
      });

      if (!project) {
        throw new Error("Only owner can edit project");
      }

      const updated = await Project.findByIdAndUpdate(
        projectId,
        { $set: updates },
        { new: true, runValidators: true },
      );

      logger.info(`Project updated: ${projectId}`);
      return updated;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async deleteProject(projectId, userId) {
    try {
      const project = await Project.findOne({
        _id: projectId,
        userId,
      });

      if (!project) {
        throw new Error("Only owner can delete project");
      }

      await Task.deleteMany({ projectId });
      await Project.findByIdAndDelete(projectId);

      logger.info(`Project deleted: ${projectId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  async addMember(projectId, userId, memberEmail, role = "editor") {
    try {
      const project = await Project.findOne({
        _id: projectId,
        userId,
      });

      if (!project) {
        throw new Error("Only owner can add members");
      }

      const member = await User.findOne({ email: memberEmail });

      if (!member) {
        throw new Error("User not found");
      }

      const isMember = project.members.some(
        (m) => m.userId.toString() === member._id.toString(),
      );

      if (isMember) {
        throw new Error("User is already a member");
      }

      project.members.push({
        userId: member._id,
        role,
      });

      await project.save();

      logger.info(`Member added to project: ${projectId}`);
      return project;
    } catch (error) {
      throw new Error(`Failed to add member: ${error.message}`);
    }
  }

  async removeMember(projectId, userId, memberIdToRemove) {
    try {
      const project = await Project.findOne({
        _id: projectId,
        userId,
      });

      if (!project) {
        throw new Error("Only owner can remove members");
      }

      project.members = project.members.filter(
        (m) => m.userId.toString() !== memberIdToRemove,
      );

      await project.save();

      logger.info(`Member removed from project: ${projectId}`);
      return project;
    } catch (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  async getProjectTasks(projectId, userId) {
    try {
      await this.getProjectById(projectId, userId);

      const tasks = await Task.find({ projectId })
        .populate("userId", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

      return tasks;
    } catch (error) {
      throw new Error(`Failed to get tasks: ${error.message}`);
    }
  }

  async getProjectStats(projectId, userId) {
    try {
      await this.getProjectById(projectId, userId);

      const tasks = await Task.find({ projectId });
      const completed = tasks.filter((t) => t.completed).length;

      const byStatus = {
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        review: tasks.filter((t) => t.status === "review").length,
        done: tasks.filter((t) => t.status === "done").length,
      };

      const byPriority = {
        low: tasks.filter((t) => t.priority === "low").length,
        medium: tasks.filter((t) => t.priority === "medium").length,
        high: tasks.filter((t) => t.priority === "high").length,
      };

      return {
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: tasks.length - completed,
        completionPercentage:
          tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
        byStatus,
        byPriority,
        overdueTasks: tasks.filter(
          (t) => !t.completed && t.dueDate < new Date(),
        ).length,
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}
