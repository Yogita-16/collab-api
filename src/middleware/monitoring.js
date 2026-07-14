import logger from "../config/logger.js";

export const slowQueryMonitor = (threshold = 1000) => {
  return (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;

      if (duration > threshold) {
        logger.warn({
          message: "Slow request detected",
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
        });
      }
    });

    next();
  };
};

export const memoryMonitor = () => {
  setInterval(() => {
    const usage = process.memoryUsage();

    if (usage.heapUsed / usage.heapTotal > 0.9) {
      logger.warn({
        message: "High memory usage",
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      });
    }
  }, 30000);
};
