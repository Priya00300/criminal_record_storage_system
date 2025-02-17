// backend/controllers/recordController.js
import { contract } from '../blockchain.js';

export const addCrime = async (req, res) => {
  try {
    const tx = await contract.addCrime(
      req.body.criminalId,
      req.body.crimeDetails
    );
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};