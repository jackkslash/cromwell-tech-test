import express from "express";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use("/user", userRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

export default app;
