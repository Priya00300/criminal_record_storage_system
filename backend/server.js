import dotenv from "dotenv";
dotenv.config();
import 'dotenv/config'; // Must be FIRST import
console.log("✅ [DEBUG] Loaded Environment Variables:", {
  PRIVATE_KEY: process.env.PRIVATE_KEY ? "Exists" : "Missing",
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL ? "Exists" : "Missing",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS ? "Exists" : "Missing",
});

import express from "express";
const app = express();
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
console.log("🔍 Debug: Trying to load authRoutes.js...");
import authRoutes from "./routes/authRoutes.js";
console.log("✅ Debug: authRoutes.js loaded successfully!");
console.log("🔍 Debug: Checking authRoutes before registering...");
console.log(authRoutes);
app.use("/auth", authRoutes);


import contractRoutes from "./routes/contractRoutes.js";
import ipfsRoutes from "./routes/ipfsRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Debug environment variables immediately
console.log("[ENV Check] Crucial Variables:", {
  mongoConnected: !!process.env.MONGODB_URI,
  blockchainRPC: !!process.env.BLOCKCHAIN_RPC_URL,
  contractAddress: !!process.env.CONTRACT_ADDRESS,
  jwtSecret: !!process.env.JWT_SECRET
});



// Database Connection with enhanced options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
app.get("/db-status", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: "connected",
      db: mongoose.connection.db.databaseName 
    });
  } catch (err) {
    res.status(500).json({
      status: "disconnected",
      error: err.message
    });
  }
});
// Enhanced Security Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend port
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later"
});
app.use("/", limiter);

// Swagger Documentation
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Criminal Record System API",
      version: "1.0.0",
      description: "API documentation for Criminal Records Management System"
    },
    servers: [
      { 
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/auth", authRoutes);
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`🛠️ Registered Route: ${r.route.path}`);
  }
});

app.use("/contract", contractRoutes);
app.use("/ipfs", ipfsRoutes);

// Health Check
app.get("/", (req, res) => 
  res.status(200).json({ 
    status: "active", 
    timestamp: new Date().toISOString()
  })
);


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`💥 Error [${err.name}]: ${err.message}`);
  
  const response = {
    status: "error",
    message: "Something went wrong!"
  };

  if (process.env.NODE_ENV === "development") {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(response);
});

// 404 Handler
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Server Initialization
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

// Start server based on environment
let server;
if (process.env.NODE_ENV !== "test") {
  server = startServer();
} else {
  server = app.listen(0);
}


export { app, server };