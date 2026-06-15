import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { apiLimiter, aiAnalysisLimiter } from "../middleware/rateLimiter.js";
import { upload } from "../middleware/upload.js";
import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  generateBullets,
  parseUpload
} from "../controllers/builderController.js";

const router = express.Router();

// Apply auth and rate limiting to all builder routes
router.use(protect);
router.use(apiLimiter);

// Standard CRUD
router.post("/", createResume);
router.get("/", getResumes);
router.get("/:id", getResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);

// AI Features
router.post("/generate-bullets", aiAnalysisLimiter, generateBullets);
router.post("/parse-upload", aiAnalysisLimiter, upload.single("resume"), parseUpload);

export default router;
