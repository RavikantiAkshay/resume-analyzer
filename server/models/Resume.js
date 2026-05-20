import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    suggestions: {
      type: mongoose.Schema.Types.Mixed, // Using Mixed to robustly support Groq AI structured object responses
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", ResumeSchema);
export default Resume;
