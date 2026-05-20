import express from "express";
import { uploadResume, analyzeResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Route: Upload a PDF resume, verify token, parse PDF text, and return extraction
// POST /resume/upload
router.post("/upload", protect, upload.single("resume"), uploadResume);

// Route: Analyze resume text against a job description
// POST /resume/analyze
router.post("/analyze", protect, analyzeResume);

export default router;
