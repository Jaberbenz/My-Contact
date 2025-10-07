import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing MongoDB connection...");

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ Connection successful!");

    // Tester une requête simple
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log("✅ Ping successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  });
