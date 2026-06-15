import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume
} from "../controllers/builderController.js";

const router = express.Router();

// Apply auth and rate limiting to all builder routes
router.use(protect);
router.use(apiLimiter);

router.post("/", createResume);
router.get("/", getResumes);
router.get("/:id", getResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);

export default router;
