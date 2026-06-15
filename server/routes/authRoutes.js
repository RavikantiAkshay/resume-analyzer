import express from "express";
import { register, login, googleLogin, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Route: User registration
// POST /auth/register
router.post("/register", authLimiter, register);

// Route: User login
// POST /auth/login
router.post("/login", authLimiter, login);

// Route: Google Authentication Login / Signup
// POST /auth/google
router.post("/google", authLimiter, googleLogin);

// Route: Get authenticated user profile (protected)
// GET /auth/profile
router.get("/profile", protect, getProfile);

export default router;
