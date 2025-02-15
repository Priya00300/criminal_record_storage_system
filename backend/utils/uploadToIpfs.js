import "dotenv/config";
import { create } from "ipfs-http-client";

// Use Infura API Key Authentication
const projectId = process.env.INFURA_PROJECT_ID;
const privateKey = process.env.INFURA_PRIVATE_KEY;

// Create a Base64-encoded authorization string
const auth = `Basic ${Buffer.from(`${projectId}:${privateKey}`).toString("base64")}`;

// Configure the IPFS client
const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: auth, // Use the Base64-encoded auth string
    },
});

// Function to upload a file
async function uploadFile(content) {
    try {
        const { path } = await ipfs.add(content);
        console.log("Uploaded to IPFS: ", path);
        return path;
    } catch (err) {
        console.error("Error uploading to IPFS:", err);
        throw err;
    }
}

// Example Usage:
uploadFile("This is a test criminal record.")
    .then((cid) => console.log("CID:", cid))
    .catch((err) => console.error("Error:", err));