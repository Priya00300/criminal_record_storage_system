import dotenv from "dotenv";
dotenv.config();
import { body, validationResult } from "express-validator";
import { register, login } from "../controllers/authController.js";
import express from "express";
const router = express.Router();

console.log("🔍 Debug: authRoutes.js is being executed!");

// Register a new user
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .trim()
      .escape(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["admin", "registrar", "viewer"])
      .withMessage("Invalid role selection"),
  ],
  async (req, res) => {
    try {
      console.log("🔍 Debug: Processing /register request...");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("🔴 Validation failed:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      console.log("✅ Validation passed. Calling register function...");
      await register(req, res);
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Login a user
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      console.log("🔍 Debug: Processing /login request...");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("🔴 Validation failed:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      console.log("✅ Validation passed. Calling login function...");
      await login(req, res);
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

console.log("✅ Debug: Exporting router from authRoutes.js");
export default router;

