import express from "express";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/user", userRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

export default app;
