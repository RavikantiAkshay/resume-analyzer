import mongoose from "mongoose";

const resumeVersionSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "ResumeBuilder", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  versionNumber: { type: Number, required: true },
  label: { type: String, default: "Snapshot" },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const ResumeVersion = mongoose.model("ResumeVersion", resumeVersionSchema);
export default ResumeVersion;
