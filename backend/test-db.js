import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

testDB();
