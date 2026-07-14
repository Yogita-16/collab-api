import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    name: "Collab API",
    version: "4.0.0",
    description: "Advanced Task Management & Collaboration Platform",
    documentation: "https://docs.collab.app",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/profile": "Get user profile",
        "PUT /api/auth/profile": "Update profile",
        "POST /api/auth/change-password": "Change password",
      },
      tasks: {
        "GET /api/tasks": "Get all tasks",
        "POST /api/tasks": "Create task",
        "GET /api/tasks/:id": "Get single task",
        "PUT /api/tasks/:id": "Update task",
        "DELETE /api/tasks/:id": "Delete task",
        "POST /api/tasks/:id/comments": "Add comment",
        "POST /api/tasks/:id/subtasks": "Add subtask",
      },
      projects: {
        "GET /api/projects": "Get user projects",
        "POST /api/projects": "Create project",
        "GET /api/projects/:id": "Get project details",
        "PUT /api/projects/:id": "Update project",
        "DELETE /api/projects/:id": "Delete project",
        "POST /api/projects/:id/members": "Add member",
        "DELETE /api/projects/:id/members/:memberId": "Remove member",
        "GET /api/projects/:id/tasks": "Get project tasks",
        "GET /api/projects/:id/stats": "Get project statistics",
      },
      uploads: {
        "POST /api/uploads/task/:taskId": "Upload file to task",
        "DELETE /api/uploads/task/:taskId/:attachmentId": "Delete attachment",
      },
    },
  });
});

export default router;
