// authController.js
import dotenv from "dotenv";
dotenv.config();

// Debugging Section - Keep at the VERY TOP
console.log("[DEBUG] Environment Check:", {
  PRIVATE_KEY_EXISTS: !!process.env.PRIVATE_KEY,
  RPC_URL_EXISTS: !!process.env.BLOCKCHAIN_RPC_URL,
  CONTRACT_ADDR_EXISTS: !!process.env.CONTRACT_ADDRESS,
  NODE_ENV: process.env.NODE_ENV
});

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import axios from "axios";
import User from "../models/User.js";
import contractABI from "../contractABI.js";

// Initialize blockchain connection with enhanced validation
let provider;
let wallet;
let contract;

try {
  // Validate environment variables
  if (!process.env.PRIVATE_KEY?.trim()) {
    throw new Error("PRIVATE_KEY is missing or empty in .env");
  }
  
  if (!process.env.BLOCKCHAIN_RPC_URL?.trim()) {
    throw new Error("BLOCKCHAIN_RPC_URL is missing in .env");
  }

  if (!process.env.CONTRACT_ADDRESS?.trim()) {
    throw new Error("CONTRACT_ADDRESS is missing in .env");
  }

  // Validate private key format
  const privateKey = process.env.PRIVATE_KEY.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error(`Invalid private key format: ${privateKey.slice(0, 8)}...`);
  }

  // Initialize blockchain components
  provider = new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL.trim(),
    31337 // Explicit chain ID for local networks
  );
  
  wallet = new ethers.Wallet(privateKey, provider);
  
  contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS.trim(),
    contractABI,
    wallet
  );

  // Verify contract connection
  const testNetwork = await provider.getNetwork();
  console.log("✅ Blockchain initialized:", {
    network: testNetwork,
    wallet: wallet.address,
    contract: contract.address
  });

} catch (err) {
  console.error("❌ FATAL Blockchain Init Error:", {
    message: err.message,
    stack: err.stack,
    env: {
      PRIVATE_KEY: process.env.PRIVATE_KEY?.slice(0, 8) + "...",
      RPC_URL: process.env.BLOCKCHAIN_RPC_URL,
      CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS
    }
  });
  process.exit(1);
}

// Enhanced registration with error handling
export const register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    console.log("Starting registration for:", username);
    
    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Registration failed - username exists:", username);
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
    );

    // Create user
    const user = new User({ 
      username, 
      password: hashedPassword, 
      role 
    });
    await user.save();
    console.log("User saved to MongoDB:", user.username);

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // IPFS Upload
    console.log("Starting IPFS upload...");
    const ipfsResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          createdAt: new Date().toISOString()
        }
      },
      {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
        timeout: 15000
      }
    );

    if (!ipfsResponse.data.IpfsHash) {
      throw new Error("IPFS upload failed - no hash returned");
    }
    console.log("IPFS upload successful:", ipfsResponse.data.IpfsHash);

    // Blockchain transaction
    console.log("Initiating blockchain transaction...");
    const tx = await contract.registerUser(
      user._id.toString(),
      ipfsResponse.data.IpfsHash,
      { gasLimit: 500000 } // Explicit gas limit
    );

    console.log("Transaction sent, waiting for confirmation...");
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error("Blockchain transaction reverted");
    }
    console.log("Blockchain transaction confirmed:", receipt.transactionHash);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        ipfsHash: ipfsResponse.data.IpfsHash,
        blockchainTx: receipt.transactionHash
      }
    });

  } catch (err) {
    console.error("Registration Failed:", {
      error: err.message,
      stack: err.stack,
      step: "Registration",
      username: username,
      contractAddress: contract?.address
    });

    return res.status(500).json({
      error: "Registration failed",
      ...(process.env.NODE_ENV === "development" && {
        details: {
          message: err.message,
          step: err.step,
          contract: process.env.CONTRACT_ADDRESS,
          ipfs: process.env.PINATA_API_KEY ? "configured" : "missing"
        }
      })
    });
  }
};

// Enhanced login controller
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Login attempt for:", username);
    
    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      console.log("Login failed - user not found:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Login failed - password mismatch:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    console.log("Successful login:", username);
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", {
      error: err.message,
      stack: err.stack,
      username: username
    });

    return res.status(500).json({
      error: "Login failed",
      ...(process.env.NODE_ENV === "development" && {
        details: {
          message: err.message,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        }
      })
    });
  }
};