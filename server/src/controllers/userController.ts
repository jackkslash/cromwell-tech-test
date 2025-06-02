import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import z from "zod";

const JwtPayloadSchema = z.object({
  id: z.string(),
});

type JwtPayload = z.infer<typeof JwtPayloadSchema>;

type AuthRequestBody = {
  name?: string;
  email: string;
  password: string;
};
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Helper to sanitize user output
const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

// Helper to generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "10s",
    algorithm: "HS256",
  });
};

// Helper to generate refresh token
const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

export const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body as AuthRequestBody;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    if (!user._id) {
      res.status(500).json({ message: "User creation failed" });
      return;
    }
    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SEVEN_DAYS_MS, // 7 days
    });
    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as AuthRequestBody;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user._id) {
      res.status(500).json({ message: "User id is undefined" });
      return;
    }
    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SEVEN_DAYS_MS, // 7 days
    });
    res.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const refreshTokenFromClient =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshTokenFromClient) {
      res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
      return;
    }

    let decodedPayload: JwtPayload;
    try {
      const decoded = jwt.verify(
        refreshTokenFromClient,
        process.env.JWT_REFRESH_SECRET as string
      );

      const parsed = JwtPayloadSchema.safeParse(decoded);

      if (!parsed.success) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
        return;
      }

      decodedPayload = parsed.data;
    } catch (jwtError) {
      console.error(jwtError);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    // Validate user exists and is active
    const user = await User.findById(decodedPayload.id);

    if (!user || !user._id) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    const newAccessToken = generateToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SEVEN_DAYS_MS,
    });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      token: newAccessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout: RequestHandler = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const getUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(sanitizeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
