import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { contract, mongoose } from "./config.js"; // Removed IPFS if not used
import authRoutes from "./routes/authRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import ipfsRoutes from "./routes/ipfsRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Criminal Record System API",
      version: "1.0.0",
    },
  },
  apis: ["./routes/*.js"], // Path to your API routes
};
const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/auth", authRoutes);
app.use("/contract", contractRoutes);
app.use("/ipfs", ipfsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Create a server instance
let server;

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} else {
  // In test mode, create the server without starting it
  server = app.listen(0); // Use port 0 to let the OS assign an available port
}

// Export both app and server
export { app, server };