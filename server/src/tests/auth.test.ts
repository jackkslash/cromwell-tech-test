import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import User from "../models/User";

// Set test environment variables
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Authentication Tests", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Test123!@#",
    confirmPassword: "Test123!@#",
  };

  describe("Registration", () => {
    it("should register a new user successfully", async () => {
      try {
        const response = await request(app)
          .post("/user/register")
          .send(testUser)
          .set("Accept", "application/json")
          .set("Content-Type", "application/json");

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("email", testUser.email);
        expect(response.body.user).toHaveProperty("name", testUser.name);
        expect(response.body.user).not.toHaveProperty("password");
      } catch (error) {
        console.error("Registration Test Error:", error);
        throw error;
      }
    });

    it("should not register a user with existing email", async () => {
      // First registration
      await request(app).post("/user/register").send(testUser);

      // Second registration with same email
      const response = await request(app).post("/user/register").send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "User already exists");
    });

    it("should validate password requirements", async () => {
      const invalidUser = {
        ...testUser,
        password: "weak",
        confirmPassword: "weak",
      };

      const response = await request(app)
        .post("/user/register")
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("Login", () => {
    beforeEach(async () => {
      // Register a user before each test
      await request(app).post("/user/register").send(testUser);
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/user/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", testUser.email);
    });

    it("should not login with incorrect password", async () => {
      const response = await request(app).post("/user/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should not login with non-existent email", async () => {
      const response = await request(app).post("/user/login").send({
        email: "nonexistent@example.com",
        password: testUser.password,
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });
  });

  describe("Protected Routes", () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await request(app)
        .post("/user/register")
        .send(testUser);
      authToken = registerResponse.body.token;
    });

    it("should access protected route with valid token", async () => {
      const response = await request(app)
        .get("/user")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("email", testUser.email);
      expect(response.body).toHaveProperty("name", testUser.name);
    });

    it("should not access protected route without token", async () => {
      const response = await request(app).get("/user");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "No token provided");
    });

    it("should not access protected route with invalid token", async () => {
      const response = await request(app)
        .get("/user")
        .set("Authorization", "Bearer invalidtoken");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Zod Validation - Registration", () => {
    it("should fail when name is missing", async () => {
      const user = {
        email: "missingname@example.com",
        password: "Test123!@#",
        confirmPassword: "Test123!@#",
      };
      const response = await request(app).post("/user/register").send(user);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("Name is required")])
      );
    });

    it("should fail when email is invalid", async () => {
      const user = {
        name: "Invalid Email",
        email: "not-an-email",
        password: "Test123!@#",
        confirmPassword: "Test123!@#",
      };
      const response = await request(app).post("/user/register").send(user);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Invalid email address"),
        ])
      );
    });

    it("should fail when password is too short", async () => {
      const user = {
        name: "Short Password",
        email: "shortpass@example.com",
        password: "T1!",
        confirmPassword: "T1!",
      };
      const response = await request(app).post("/user/register").send(user);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Password must be at least 8 characters"),
        ])
      );
    });

    it("should fail when password is missing a special character", async () => {
      const user = {
        name: "No Special",
        email: "nospecial@example.com",
        password: "Test12345",
        confirmPassword: "Test12345",
      };
      const response = await request(app).post("/user/register").send(user);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            "Password must contain at least one special character"
          ),
        ])
      );
    });

    it("should fail when confirmPassword does not match password", async () => {
      const user = {
        name: "Mismatch",
        email: "mismatch@example.com",
        password: "Test123!@#",
        confirmPassword: "Different123!@#",
      };
      const response = await request(app).post("/user/register").send(user);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Passwords do not match"),
        ])
      );
    });
  });

  describe("Zod Validation - Login", () => {
    it("should fail when email is missing", async () => {
      const response = await request(app)
        .post("/user/login")
        .send({ password: "Test123!@#" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Invalid email address"),
        ])
      );
    });

    it("should fail when password is missing", async () => {
      const response = await request(app)
        .post("/user/login")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Password is required"),
        ])
      );
    });

    it("should fail when email is invalid", async () => {
      const response = await request(app)
        .post("/user/login")
        .send({ email: "not-an-email", password: "Test123!@#" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Invalid email address"),
        ])
      );
    });
  });

  describe("Token Refresh", () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register to get refresh token
      const response = await request(app).post("/user/register").send(testUser);
      refreshToken = response.headers["set-cookie"][0]
        .split(";")[0]
        .split("=")[1];
    });

    it("should refresh token successfully", async () => {
      const response = await request(app)
        .get("/user/refresh")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
    });

    it("should not refresh token with invalid refresh token", async () => {
      const response = await request(app)
        .get("/user/refresh")
        .set("Cookie", ["refreshToken=invalidtoken"]);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid refresh token");
    });
  });
});
