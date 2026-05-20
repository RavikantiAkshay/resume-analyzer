import express from "express";
import { register, login, googleLogin, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route: User registration
// POST /auth/register
router.post("/register", register);

// Route: User login
// POST /auth/login
router.post("/login", login);

// Route: Google Authentication Login / Signup
// POST /auth/google
router.post("/google", googleLogin);

// Route: Get authenticated user profile (protected)
// GET /auth/profile
router.get("/profile", protect, getProfile);

export default router;
