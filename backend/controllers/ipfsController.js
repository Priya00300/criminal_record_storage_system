import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Pinata SDK
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// Function to upload a file to Pinata IPFS
export const uploadToIPFS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert the file buffer to a readable stream
    const readableStream = require("stream").Readable.from(req.file.buffer);

    // Upload the file to Pinata IPFS
    const result = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: {
        name: req.file.originalname, // Use the original file name
      },
    });

    // Return the IPFS CID (hash) to the client
    res.status(200).json({ cid: result.IpfsHash });
  } catch (error) {
    console.error("Error uploading to Pinata IPFS:", error);
    res.status(500).json({ error: "Failed to upload file to IPFS" });
  }
};