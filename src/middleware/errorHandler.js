import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  let statusCode = 500;
  let message = "Internal server error";
  let details = {};

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.entries(err.errors).reduce((acc, [field, error]) => {
      acc[field] = error.message;
      return acc;
    }, {});
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose Cast Error
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Custom error with statusCode
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    ...(Object.keys(details).length > 0 && { details }),
    status: statusCode,
    timestamp: new Date().toISOString(),
  });
};
