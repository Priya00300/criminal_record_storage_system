import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // 2. Verify token format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // 3. Extract and verify token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    // 4. Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Attach user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (err) {
    // Handle specific JWT errors
    let errorMessage = "Invalid token";
    if (err.name === "TokenExpiredError") {
      errorMessage = "Token expired";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "Invalid token signature";
    }

    console.error("Authentication error:", errorMessage);
    return res.status(401).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === "development" && { details: err.message })
    });
  }
};