import { app, server } from "../server.js"; // Import both app and server
import mongoose from "mongoose";
import request from "supertest";
import User from "../models/User.js"; // Import the User model

describe("Auth Routes", () => {
  beforeEach(async () => {
    await User.deleteMany({}); // Clear the users collection before each test
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "testuser", password: "testpass", role: "viewer" });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail to register with invalid data", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "tu", password: "tp", role: "invalid" });
    expect(res.statusCode).toEqual(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close(); // Close MongoDB connection
  server.close(); // Close server
});