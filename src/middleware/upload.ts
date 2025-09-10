import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Creates a dynamic multer instance with a custom prefix
 * @param prefixKey A function that returns the prefix string
 */
export const createUpload = (prefixKey: (req: Request) => string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Always upload to /uploads folder
    },
    filename: (req, file, cb) => {
      try {
        const ext = path.extname(file.originalname);

        // Get dynamic prefix using provided function
        const prefix = prefixKey(req);

        if (!prefix) {
          return cb(new Error("Prefix for file naming is required"), "");
        }

        // Remove old files with the same prefix
        const files = fs.readdirSync(uploadDir);
        files.forEach((existingFile) => {
          if (existingFile.startsWith(prefix)) {
            fs.unlinkSync(path.join(uploadDir, existingFile));
          }
        });

        // Create new filename
        const timestamp = Date.now();
        const finalName = `${prefix}_${timestamp}${ext}`;

        cb(null, finalName);
      } catch (error) {
        cb(error as Error, "");
      }
    },
  });

  return multer({ storage });
};
