import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import axios from "axios";
import User from "../models/User.js";
import contractABI from "../contractABI.js";

// Debugging Section - Keep at the VERY TOP
console.log("[DEBUG] Environment Check:", {
  PRIVATE_KEY_EXISTS: !!process.env.PRIVATE_KEY,
  RPC_URL_EXISTS: !!process.env.BLOCKCHAIN_RPC_URL,
  CONTRACT_ADDR_EXISTS: !!process.env.CONTRACT_ADDRESS,
  NODE_ENV: process.env.NODE_ENV,
});

// Initialize blockchain connection with validation
let provider, wallet, contract;

try {
  if (!process.env.PRIVATE_KEY?.trim()) throw new Error("PRIVATE_KEY is missing in .env");
  if (!process.env.BLOCKCHAIN_RPC_URL?.trim()) throw new Error("BLOCKCHAIN_RPC_URL is missing in .env");
  if (!process.env.CONTRACT_ADDRESS?.trim()) throw new Error("CONTRACT_ADDRESS is missing in .env");

  provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL.trim(), 31337);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY.trim(), provider);
  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS.trim(), contractABI, wallet);

  console.log("✅ Blockchain initialized:", { network: await provider.getNetwork(), wallet: wallet.address });
} catch (err) {
  console.error("❌ Blockchain Init Error:", err.message);
  process.exit(1);
}

// User Registration Handler
export const register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    console.log("🔍 Debug: Registering user:", { username, role });

    if (!username || !password || !role) return res.status(400).json({ error: "Missing required fields" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(409).json({ error: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("✅ Password hashed successfully");

    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    console.log("✅ User saved in MongoDB:", user.username);

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("✅ JWT token generated");

    console.log("🚀 Initiating IPFS upload...");
    const ipfsResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      { user: { id: user._id, username: user.username, role: user.role, createdAt: new Date().toISOString() } },
      { headers: { pinata_api_key: process.env.PINATA_API_KEY, pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY }, timeout: 15000 }
    );
    if (!ipfsResponse.data.IpfsHash) throw new Error("IPFS upload failed");
    console.log("✅ IPFS upload successful:", ipfsResponse.data.IpfsHash);

    console.log("🚀 Sending blockchain transaction...");
    const tx = await contract.registerUser(user._id.toString(), ipfsResponse.data.IpfsHash, { gasLimit: 500000 });
    const receipt = await tx.wait();
    if (receipt.status !== 1) throw new Error("Blockchain transaction reverted");
    console.log("✅ Blockchain transaction confirmed:", receipt.transactionHash);

    return res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role, ipfsHash: ipfsResponse.data.IpfsHash, blockchainTx: receipt.transactionHash } });
  } catch (err) {
    console.error("❌ Registration Failed:", err.message);
    return res.status(500).json({ error: "Registration failed", details: err.message });
  }
};

// User Login Handler
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("🔍 Debug: Login attempt for:", username);
    if (!username || !password) return res.status(400).json({ error: "Missing credentials" });

    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("✅ Successful login for:", username);

    return res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
};