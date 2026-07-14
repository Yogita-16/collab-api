import "./env.js";
import nodemailer from "nodemailer";
import logger from "./logger.js";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error("Email service error:", error);
  } else {
    logger.info("✓ Email service ready");
  }
});

export default transporter;
