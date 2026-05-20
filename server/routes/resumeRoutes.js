import express from "express";
import { uploadResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Route: Upload a PDF resume, verify token, parse PDF text, and return extraction
// POST /resume/upload
router.post("/upload", protect, upload.single("resume"), uploadResume);

export default router;
