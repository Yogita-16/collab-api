import User from "../models/User.js";
import logger from "../config/logger.js";

export class UserService {
  async registerUser(userData) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error("Email already registered");
      }

      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      logger.info(`New user registered: ${user.email}`);
      return user.toJSON();
    } catch (error) {
      logger.error(`Registration failed: ${error.message}`);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      user.lastLogin = new Date();
      await user.save();

      logger.info(`User logged in: ${user.email}`);
      return user.toJSON();
    } catch (error) {
      logger.error(`Login failed: ${error.message}`);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async updateUser(userId, updates) {
    try {
      delete updates.password;
      delete updates.email;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select("+password");

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        throw new Error("Old password is incorrect");
      }

      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
      return { message: "Password changed successfully" };
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }
}
