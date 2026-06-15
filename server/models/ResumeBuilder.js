import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  company: { type: String, default: "" },
  role: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  current: { type: Boolean, default: false },
  description: { type: String, default: "" },
  bullets: [{ type: String }],
});

const educationSchema = new mongoose.Schema({
  school: { type: String, default: "" },
  degree: { type: String, default: "" },
  fieldOfStudy: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  current: { type: Boolean, default: false },
  grade: { type: String, default: "" }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  link: { type: String, default: "" },
  description: { type: String, default: "" },
  technologies: [{ type: String }],
  bullets: [{ type: String }]
});

const resumeBuilderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "Untitled Resume" },
  template: { type: String, default: "classic" },
  
  personalInfo: {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    github: { type: String, default: "" },
    summary: { type: String, default: "" }
  },

  experience: [experienceSchema],
  education: [educationSchema],
  projects: [projectSchema],
  skills: { type: [String], default: [] },
  certifications: [{ title: String, issuer: String, date: String }],
  customSections: [{ title: String, body: String }],
  
}, { timestamps: true });

const ResumeBuilder = mongoose.model("ResumeBuilder", resumeBuilderSchema);
export default ResumeBuilder;
