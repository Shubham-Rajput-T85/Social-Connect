import multer from "multer";
import path from "path";
import fs from "fs";

// Define absolute path for uploads directory
const uploadDir = path.join(__dirname, "../../uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create a simple multer instance
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Save files to /uploads
    },
    filename: (req, file, cb) => {
      // Just use a timestamp and keep the original extension
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
});

export const deleteOldFile = (filename: string) => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted old file: ${filePath}`);
  }
};