import logger from "./logger.js";

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    logger.info(`[SOCKET] User connected: ${socket.id}`);

    // Join room based on project
    socket.on("joinProject", (projectId, userId) => {
      socket.join(`project-${projectId}`);
      logger.info(`[SOCKET] User ${userId} joined project ${projectId}`);

      // Notify others
      socket.to(`project-${projectId}`).emit("userJoined", {
        userId,
        message: "User joined the project",
      });
    });

    // Leave room
    socket.on("leaveProject", (projectId, userId) => {
      socket.leave(`project-${projectId}`);
      logger.info(`[SOCKET] User ${userId} left project ${projectId}`);

      socket.to(`project-${projectId}`).emit("userLeft", {
        userId,
        message: "User left the project",
      });
    });

    // Task created
    socket.on("taskCreated", (data) => {
      logger.info(`[SOCKET] Task created: ${data.taskId}`);
      socket.to(`project-${data.projectId}`).emit("taskCreated", data);
    });

    // Task updated
    socket.on("taskUpdated", (data) => {
      logger.info(`[SOCKET] Task updated: ${data.taskId}`);
      socket.to(`project-${data.projectId}`).emit("taskUpdated", data);
    });

    // Task deleted
    socket.on("taskDeleted", (data) => {
      logger.info(`[SOCKET] Task deleted: ${data.taskId}`);
      socket.to(`project-${data.projectId}`).emit("taskDeleted", data);
    });

    // Task completed
    socket.on("taskCompleted", (data) => {
      logger.info(`[SOCKET] Task completed: ${data.taskId}`);
      socket.to(`project-${data.projectId}`).emit("taskCompleted", data);
    });

    // Comment added
    socket.on("commentAdded", (data) => {
      logger.info(`[SOCKET] Comment added to task: ${data.taskId}`);
      socket.to(`project-${data.projectId}`).emit("commentAdded", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      logger.info(`[SOCKET] User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on("error", (error) => {
      logger.error(`[SOCKET] Error: ${error}`);
    });
  });

  return io;
};
