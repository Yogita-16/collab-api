import transporter from "../config/email.js";
import logger from "../config/logger.js";

export class EmailService {
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Welcome to Collab! 🎉",
        html: `
          <h1>Welcome ${user.name}!</h1>
          <p>Your account has been created successfully.</p>
          <p>Start organizing your tasks and collaborate with your team.</p>
          <a href="${process.env.API_URL || "http://localhost:3000"}/login">Login to Collab</a>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendTaskAssignedEmail(task, assignedUser) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: assignedUser.email,
        subject: `New task assigned: ${task.title}`,
        html: `
          <h2>You have a new task!</h2>
          <p><strong>${task.title}</strong></p>
          <p>Priority: <strong>${task.priority}</strong></p>
          <p>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</p>
          <p>${task.description}</p>
          <a href="${process.env.API_URL || "http://localhost:3000"}/tasks/${task._id}">View Task</a>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Task assignment email sent to ${assignedUser.email}`);
    } catch (error) {
      logger.error(`Failed to send task assignment email: ${error.message}`);
    }
  }

  async sendDueSoonReminder(task, user) {
    try {
      const daysUntilDue = Math.ceil(
        (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24),
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: "${task.title}" due in ${daysUntilDue} days`,
        html: `
          <h2>Task Due Soon!</h2>
          <p><strong>${task.title}</strong></p>
          <p>Due in: <strong>${daysUntilDue} days</strong></p>
          <a href="${process.env.API_URL || "http://localhost:3000"}/tasks/${task._id}">View Task</a>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error(`Failed to send reminder: ${error.message}`);
    }
  }
}
