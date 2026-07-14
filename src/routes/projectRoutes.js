import express from "express";
import * as projectController from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";
import { validateProject } from "../middleware/validation.js";

const router = express.Router();

router.use(authenticate);

router.post("/", validateProject, projectController.createProject);
router.get("/", projectController.getUserProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", validateProject, projectController.updateProject);
router.delete("/:id", projectController.deleteProject);
router.post("/:id/members", projectController.addMember);
router.delete("/:id/members/:memberId", projectController.removeMember);
router.get("/:id/tasks", projectController.getProjectTasks);
router.get("/:id/stats", projectController.getProjectStats);

export default router;
