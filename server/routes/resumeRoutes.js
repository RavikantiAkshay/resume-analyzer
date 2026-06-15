import express from "express";
import { uploadResume, analyzeResume, getResumeHistory } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { apiLimiter, aiAnalysisLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Route: Upload a PDF resume, verify token, parse PDF text, and return extraction
// POST /resume/upload
router.post("/upload", protect, apiLimiter, upload.single("resume"), uploadResume);

// Route: Analyze resume text against a job description
// POST /resume/analyze
router.post("/analyze", protect, aiAnalysisLimiter, analyzeResume);

// Route: Get history of past resume analyses
// GET /resume/history
router.get("/history", protect, apiLimiter, getResumeHistory);

export default router;
