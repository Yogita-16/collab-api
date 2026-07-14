import { ProjectService } from "../services/projectService.js";
import logger from "../config/logger.js";

const projectService = new ProjectService();

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getUserProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.id);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(
      req.params.id,
      req.user.id,
    );
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = await projectService.addMember(
      req.params.id,
      req.user.id,
      email,
      role,
    );
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const project = await projectService.removeMember(
      req.params.id,
      req.user.id,
      memberId,
    );
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req, res, next) => {
  try {
    const tasks = await projectService.getProjectTasks(
      req.params.id,
      req.user.id,
    );
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getProjectStats = async (req, res, next) => {
  try {
    const stats = await projectService.getProjectStats(
      req.params.id,
      req.user.id,
    );
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
