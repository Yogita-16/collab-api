import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing MongoDB connection...");
console.log("MONGODB_URI:", process.env.MONGODB_URI);

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ SUCCESS: Connected to MongoDB!");
    console.log("Database:", mongoose.connection.db.databaseName);

    // List collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Collections:",
      collections.map((c) => c.name),
    );

    await mongoose.disconnect();
    console.log("✅ Disconnected");
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

test();
