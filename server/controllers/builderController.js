import fs from "fs";
import ResumeBuilder from "../models/ResumeBuilder.js";
import { parseResume } from "../utils/resumeParser.js";
import { generateStarBullets, parseResumeToStructuredData } from "../utils/builderAi.js";

// Helper to strip fake IDs from frontend (e.g. timestamp strings)
const sanitizeSections = (sections) => {
  if (!sections) return sections;
  const cleaned = { ...sections };
  const arrayFields = ['experience', 'education', 'projects', 'certifications'];
  
  arrayFields.forEach(field => {
    if (cleaned[field] && Array.isArray(cleaned[field])) {
      cleaned[field] = cleaned[field].map(item => {
        const itemCopy = { ...item };
        // If _id is not a valid 24 char hex, delete it so Mongoose can create a new one
        if (itemCopy._id && !/^[0-9a-fA-F]{24}$/.test(itemCopy._id)) {
          delete itemCopy._id;
        }
        return itemCopy;
      });
    }
  });
  return cleaned;
};

export const createResume = async (req, res, next) => {
  try {
    const sanitizedData = sanitizeSections(req.body);
    const resume = await ResumeBuilder.create({
      ...sanitizedData,
      userId: req.user._id,
    });
    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await ResumeBuilder.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await ResumeBuilder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResume = async (req, res, next) => {
  try {
    const sanitizedData = sanitizeSections(req.body);
    const resume = await ResumeBuilder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      sanitizedData,
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await ResumeBuilder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    return res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateBullets = async (req, res, next) => {
  try {
    const { rawExperience } = req.body;
    if (!rawExperience) {
      return res.status(400).json({ success: false, message: "Raw experience is required" });
    }
    const bullets = await generateStarBullets(rawExperience);
    return res.status(200).json({ success: true, data: bullets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const parseUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded!" });
    }

    // Read the file from the disk
    const fileBuffer = fs.readFileSync(req.file.path);

    // Call PDF parser utility to extract raw text
    const extractedText = await parseResume(fileBuffer);

    // Delete the temporary file from the disk
    fs.unlinkSync(req.file.path);

    // Use AI to structure the text
    const structuredData = await parseResumeToStructuredData(extractedText);

    return res.status(200).json({ success: true, data: structuredData });
  } catch (err) {
    console.error("Parse Upload Error:", err.message);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {}
    }
    return res.status(500).json({ success: false, message: "Failed to parse resume.", error: err.message });
  }
};
