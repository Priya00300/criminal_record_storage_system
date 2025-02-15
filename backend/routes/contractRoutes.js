import express from "express";
import { registerCriminal, addCrime } from "../controllers/contractController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/register-criminal", registerCriminal);
router.post("/add-crime", addCrime);

export default router;