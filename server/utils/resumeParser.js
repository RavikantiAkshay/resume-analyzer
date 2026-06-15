import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly assign the worker to avoid main-thread blocking
pdfjsLib.GlobalWorkerOptions.workerSrc = path.resolve(__dirname, "../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");

/**
 * Parses an uploaded PDF resume buffer and extracts all raw text content.
 * Handles empty, corrupted, or non-text PDFs gracefully.
 * 
 * @param {Buffer} fileBuffer - The PDF file stored as memory buffer.
 * @returns {Promise<string>} The extracted text content.
 */
export const parseResume = async (fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Empty file buffer provided.");
  }

  try {
    // Convert Buffer to Uint8Array as required by PDF.js
    const data = new Uint8Array(fileBuffer);

    // Load the document from the binary array
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      useSystemFonts: true,
      disableFontFace: true, // Speeds up extraction by skipping fonts rendering
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    // Loop through all pages of the document
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Join all text item fragments on the page with spaces
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      fullText += pageText + "\n";
    }

    const trimmedText = fullText.trim();
    if (!trimmedText) {
      throw new Error("No readable text found in the PDF. It might be scanned or empty.");
    }

    return trimmedText;
  } catch (err) {
    console.error("PDF Parsing Error:", err);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
};
