import dotenv from "dotenv";

dotenv.config();

console.log("=== ENVIRONMENT VARIABLES ===");
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "✅ SET" : "❌ NOT SET",
);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("============================");
