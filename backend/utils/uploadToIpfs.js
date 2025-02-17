import { create } from "ipfs-http-client";
import mongoose from "mongoose";
import fs from "fs";
import { ethers } from "ethers"; // Added ethers import

// Read JSON file using `fs`
const CriminalRecordSystem = JSON.parse(
  fs.readFileSync("./artifacts/contracts/CriminalRecordSystem.sol/CriminalRecordSystem.json", "utf-8")
);

// Blockchain configuration - Updated to use Pinata RPC
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, CriminalRecordSystem.abi, wallet);

// IPFS configuration - Updated for Pinata
const ipfs = create({
  host: "api.pinata.cloud",
  port: 443,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.PINATA_API_KEY}:${process.env.PINATA_SECRET_API_KEY}`
    ).toString("base64")}`,
  },
});

// MongoDB configuration
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { contract, ipfs, mongoose };