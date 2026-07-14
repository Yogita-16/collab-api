import jwt from "jsonwebtoken";
import { UserService } from "../services/userService.js";
import { EmailService } from "../services/emailService.js";
import logger from "../config/logger.js";

const userService = new UserService();
const emailService = new EmailService();
const SECRET = process.env.JWT_SECRET || "secret-key";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const user = await userService.registerUser({ name, email, password });

    // Send welcome email
    await emailService.sendWelcomeEmail(user);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await userService.loginUser(email, password);

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.json({ message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    await userService.changePassword(req.user.id, oldPassword, newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
