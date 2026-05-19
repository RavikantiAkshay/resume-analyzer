import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

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

// Basic test/ping route
app.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "Server is running smoothly" });
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
