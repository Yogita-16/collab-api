import rateLimit from "express-rate-limit";
import logger from "../config/logger.js";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: false,
  skip: (req) => req.path === "/api/health",
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many auth attempts",
  skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "API rate limit exceeded",
});
