import "dotenv/config";
import pinataSDK from "@pinata/sdk";
import mongoose from "mongoose";
import fs from "fs";
import { JsonRpcProvider, Wallet, Contract } from "ethers";

// Initialize Pinata SDK
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// ✅ Read JSON file using correct path
const CriminalRecordSystem = JSON.parse(
  fs.readFileSync("../out/CriminalRecordSystem.sol/CriminalRecordSystem.json", "utf-8")
);

// ✅ Use correct Ethers v6 provider and contract initialization
const provider = new JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const contract = new Contract(process.env.CONTRACT_ADDRESS, CriminalRecordSystem.abi, wallet);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {if (process.env.NODE_ENV !== "test") {
    console.log("✅ MongoDB Connected Successfully");
  }}
  )
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

export { contract, pinata, mongoose };
