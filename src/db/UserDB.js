// src/db/UserDB.js
import fs from "fs/promises";

export class UserDB {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async ensureFile() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
    }
  }

  async readUsers() {
    await this.ensureFile();
    const data = await fs.readFile(this.filePath, "utf-8");
    return JSON.parse(data);
  }

  async writeUsers(users) {
    await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
  }

  async findByEmail(email) {
    const users = await this.readUsers();
    return users.find((u) => u.email === email);
  }

  async createUser(user) {
    const users = await this.readUsers();
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      ...user,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await this.writeUsers(users);
    return newUser;
  }
}
