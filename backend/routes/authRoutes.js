import { body, validationResult } from "express-validator";
import { register, login } from "../controllers/authController.js";
import express from "express";

const router = express.Router();

// Register a new user
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).trim().escape(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["admin", "registrar", "viewer"]),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    register(req, res);
  }
);

// Login a user
router.post("/login", login);

export default router;