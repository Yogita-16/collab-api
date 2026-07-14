import fs from "fs/promises";
import path from "path";
export class TaskDB {
  constructor(filePath) {
    this.filePath = filePath;
  }
  async ensureFileExists() {
    try {
      await fs.access(this.filePath);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
      } else {
        throw err;
      }
    }
  }
  async readTasks() {
    await this.ensureFileExists();
    const data = await fs.readFile(this.filePath, "utf-8");
    return JSON.parse(data);
  }
  async writeTasks(tasks) {
    await this.ensureFileExists();
    await fs.writeFile(this.filePath, JSON.stringify(tasks, null, 2), "utf-8");
  }
  async getAllTasks() {
    return this.readTasks();
  }

  async getTaskById(id) {
    const tasks = await this.readTasks();
    return tasks.find((t) => t.id === parseInt(id));
  }
  async createTask(task) {
    const tasks = await this.readTasks();
    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      ...task,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await this.writeTasks(tasks);
    return newTask;
  }
  async updateTask(id, updatedFields) {
    const tasks = await this.readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === parseInt(id));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedFields };
    await this.writeTasks(tasks);
    return tasks[taskIndex];
  }
  async deleteTask(id) {
    const tasks = await this.readTasks();
    const filtered = tasks.filter((t) => t.id !== parseInt(id));
    if (filtered.length === tasks.length) return false;

    await this.writeTasks(filtered);
    return true;
    /*const taskIndex = tasks.findIndex((t) => t.id === parseInt(id));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    tasks.splice(taskIndex, 1);
    await this.writeTasks(tasks);*/
  }
}
