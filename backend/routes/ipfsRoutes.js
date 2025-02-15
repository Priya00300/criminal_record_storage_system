import express from "express";
import multer from "multer";
import { uploadToIPFS } from "../controllers/ipfsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const upload = multer();
const router = express.Router();

router.use(authenticate);

// Route to upload a file to Pinata IPFS
router.post("/upload", upload.single("file"), uploadToIPFS);

export default router;