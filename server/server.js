import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Allow requests from our Vite frontend
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);

// Basic test/ping route
app.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "Server is running smoothly" });
});

// Global error handler (catches Multer file-size/type errors, etc.)
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large. Maximum allowed size is 10MB.",
    });
  }
  if (err.message === "Only PDF files are supported!") {
    return res.status(415).json({
      success: false,
      message: err.message,
    });
  }
  console.error("Unhandled Error:", err);
  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Database connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/resume_ats_analyzer";
mongoose.connect(mongoUri)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    // Start listening once database connection is established
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

