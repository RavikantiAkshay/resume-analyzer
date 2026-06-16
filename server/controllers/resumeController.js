import fs from "fs";
import { parseResume } from "../utils/resumeParser.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { calculateATSScore } from "../utils/atsScore.js";
import { analyzeWithGroq } from "../utils/aiAnalyzer.js";
import Resume from "../models/Resume.js";

/**
 * Controller to handle resume PDF upload and text parsing
 * POST /resume/upload
 */
export const uploadResume = async (req, res) => {
  try {
    // Check if the file is successfully parsed and attached by multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded! Please upload a valid PDF resume file.",
      });
    }

    // Read the file from the disk
    const fileBuffer = fs.readFileSync(req.file.path);

    // Call PDF parser utility to extract text content
    const extractedText = await parseResume(fileBuffer);

    // Grab first 500 characters for preview purposes
    const preview = extractedText.substring(0, 500) + (extractedText.length > 500 ? "..." : "");

    // Return the parsed response to the user
    return res.status(200).json({
      success: true,
      message: "Resume uploaded and parsed successfully!",
      preview,
      text: extractedText,
    });
  } catch (err) {
    console.error("Resume Upload & Parsing Controller Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to parse the uploaded resume.",
      error: err.message,
    });
  } finally {
    // Always clean up the file
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Failed to delete temp file:", unlinkErr);
      }
    }
  }
};

/**
 * Controller to handle ATS scoring and AI analysis
 * POST /resume/analyze
 */
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription, industry } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Both resumeText and jobDescription are required.",
      });
    }

    // 1. Keyword Extraction
    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = extractKeywords(jobDescription);

    // 2. Deduplicate for detailed comparison
    const uniqueJdKeywords = [...new Set(jdKeywords)];
    const resumeKeywordSet = new Set(resumeKeywords);

    const matchedKeywords = uniqueJdKeywords.filter((kw) => resumeKeywordSet.has(kw));
    const missingKeywords = uniqueJdKeywords.filter((kw) => !resumeKeywordSet.has(kw));

    // 3. ATS Score Calculation
    const atsScore = calculateATSScore(jdKeywords, resumeKeywords);

    // 4. Groq AI Analysis
    const targetIndustry = industry || "General";
    const suggestions = await analyzeWithGroq(resumeText, jobDescription, targetIndustry);

    // 5. Save to Database
    const newResume = await Resume.create({
      userId: req.user._id,
      text: resumeText,
      atsScore,
      suggestions,
    });

    // 6. Return enriched response
    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully!",
      atsScore,
      keywordStats: {
        totalJdKeywords: uniqueJdKeywords.length,
        matchedCount: matchedKeywords.length,
        missingCount: missingKeywords.length,
        matchedKeywords,
        missingKeywords,
      },
      suggestions,
      resumeId: newResume._id,
    });
  } catch (err) {
    console.error("Resume Analysis Controller Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze the resume.",
      error: err.message,
    });
  }
};

/**
 * Controller to fetch resume analysis history
 * GET /resume/history
 */
export const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: resumes.length,
      history: resumes,
    });
  } catch (err) {
    console.error("Fetch History Controller Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume history.",
      error: err.message,
    });
  }
};
