import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.error("[AUTH] No authorization header");
      return res.status(401).json({ error: "No token provided" });
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader.split(" ")[1];

    if (!token) {
      logger.error("[AUTH] Token is empty");
      return res.status(401).json({ error: "No token provided" });
    }

    logger.info(
      "[AUTH] Verifying token with SECRET:",
      process.env.JWT_SECRET?.substring(0, 10) + "...",
    );

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    logger.info(`[AUTH] ✅ Token verified for user: ${decoded.id}`);

    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`[AUTH] ❌ Error: ${error.message}`);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.status(401).json({ error: "Authentication failed" });
  }
};
