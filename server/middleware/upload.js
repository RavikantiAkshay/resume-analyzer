import multer from "multer";

// Configure storage to keep files in memory as Buffers
const storage = multer.memoryStorage();

// File filter to restrict uploads to PDF files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are supported!"), false);
  }
};

// Initialize Multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});
