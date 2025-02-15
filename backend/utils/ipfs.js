import "dotenv/config";
import pinataSDK from "@pinata/sdk";
import { Readable } from "stream"; // Import Readable to convert content to a stream

// Initialize Pinata SDK
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// Function to upload a file to Pinata IPFS
export const uploadFile = async (content, fileName = "file.txt") => {
  try {
    // Convert content to a readable stream
    const readableStream = Readable.from([content]);

    // Upload the file to Pinata IPFS
    const result = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: {
        name: fileName, // Use the provided file name or a default
      },
    });

    console.log("Uploaded to Pinata IPFS: ", result.IpfsHash);
    return result.IpfsHash; // Return the CID
  } catch (err) {
    console.error("Error uploading to Pinata IPFS:", err);
    throw err;
  }
};

// Example Usage:
uploadFile("This is a test criminal record.", "test-file.txt")
  .then((cid) => console.log("CID:", cid))
  .catch((err) => console.error("Error:", err));

export default pinata;