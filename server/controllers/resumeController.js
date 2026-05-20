import { parseResume } from "../utils/resumeParser.js";

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

    // Call PDF parser utility to extract text content
    const extractedText = await parseResume(req.file.buffer);

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
  }
};
