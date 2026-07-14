import { connectDB, disconnectDB } from "../src/config/database.js";

// Connect to test database
beforeAll(async () => {
  await connectDB();
});

// Disconnect after all tests
afterAll(async () => {
  await disconnectDB();
});
