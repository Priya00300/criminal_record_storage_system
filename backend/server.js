import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { body, validationResult } from "express-validator";
import { register, login } from "./controllers/authController.js"; // Ensure controllers are correct

const app = express();

// ✅ Debugging Environment Variables
console.log("✅ [DEBUG] Loaded Environment Variables:", {
  PRIVATE_KEY: process.env.PRIVATE_KEY ? "Exists" : "Missing",
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL ? "Exists" : "Missing",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS ? "Exists" : "Missing",
});

// ✅ Apply Essential Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use("/", limiter);

// ✅ Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ✅ Health Check Endpoint
app.get("/db-status", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({
      status: "connected",
      db: mongoose.connection.db.databaseName,
    });
  } catch (err) {
    res.status(500).json({
      status: "disconnected",
      error: err.message,
    });
  }
});

// ✅ DIRECTLY DEFINE AUTH ROUTES INSIDE `server.js`
console.log("🔍 Debug: Registering auth routes directly inside `server.js`...");
app.post(
  "/auth/register",
  [
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters").trim().escape(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["admin", "registrar", "viewer"]).withMessage("Invalid role selection"),
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

app.post(
  "/auth/login",
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

// ✅ Manually register a test route
app.get("/auth/test-route", (req, res) => {
  res.json({ message: "Test route working!" });
});
console.log("✅ Manually registered test route at /auth/test-route");

// ✅ Register Other Routes
import contractRoutes from "./routes/contractRoutes.js";
import ipfsRoutes from "./routes/ipfsRoutes.js";
app.use("/contract", contractRoutes);
app.use("/ipfs", ipfsRoutes);

// ✅ Check That Routes Were Registered
console.log("🔍 Debug: Listing all registered routes...");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`🛠️ Registered Route: ${r.route.path}`);
  }
});

// ✅ Swagger Documentation
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Criminal Record System API",
      version: "1.0.0",
      description: "API documentation for Criminal Records Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// ✅ 404 Handler
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ✅ Server Initialization
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
    return server;
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

// ✅ Start Server Based on Environment
let server;
if (process.env.NODE_ENV !== "test") {
  server = startServer();
} else {
  server = app.listen(0);
}

export { app, server };
