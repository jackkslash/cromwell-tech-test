import express from "express";
import {
  register,
  login,
  getUser,
  refreshToken,
  logout,
} from "../controllers/userController";
import authMiddleware from "../middleware/auth";
import { validate } from "../middleware/validator";
import { loginSchema, registerSchema } from "../validator/userSchemas";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/refresh", refreshToken);

router.get("/", authMiddleware, getUser);

export default router;
