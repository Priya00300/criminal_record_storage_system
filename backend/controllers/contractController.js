import { contract } from "../config.js";

// Register a criminal
export const registerCriminal = async (req, res) => {
  const { criminalAddress } = req.body;

  try {
    const tx = await contract.registerCriminal(criminalAddress);
    await tx.wait();
    res.json({ message: "Criminal registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a crime
export const addCrime = async (req, res) => {
  const { recordId, description, ipfsHash } = req.body;

  try {
    const tx = await contract.addCrime(recordId, description, ipfsHash);
    await tx.wait();
    res.json({ message: "Crime added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};