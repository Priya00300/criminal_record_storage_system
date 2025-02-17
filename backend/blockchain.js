// backend/blockchain.js
import { ethers } from 'ethers';
import CriminalRecordSystem from './artifacts/CriminalRecordSystem.json' assert { type: 'json' };

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// blockchain.js
export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  CriminalRecordSystem.abi,
  wallet
);