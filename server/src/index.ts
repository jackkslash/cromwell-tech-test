import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!process.env.JWT_SECRET) throw new Error("JWT secret not configured");
  if (!process.env.JWT_REFRESH_SECRET)
    throw new Error("JWT refresh secret not configured");
  if (!process.env.MONGO_URI) throw new Error("MongoDB URI not configured");

  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
