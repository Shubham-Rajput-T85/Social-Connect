import { Router } from "express";
import * as postController from "../controllers/postController";
// import { upload } from "../middleware/upload";
import { validate } from "../middleware/inputValidation";
import { createUpload } from "../middleware/upload";

const router = Router();

// Dynamic upload for post media
const postMediaUpload = createUpload((req) => {
    const userId = req.body.userId?.trim();
    return userId ? `${userId}_post` : "";
  });

router.post('/addPost', postMediaUpload.single("media"), postController.addPost);


export default router;
