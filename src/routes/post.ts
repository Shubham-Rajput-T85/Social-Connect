import { Router } from "express";
import * as postController from "../controllers/postController";
import { validate } from "../middleware/inputValidation";
import { upload } from "../middleware/upload";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

router.post('/addPost', isAuthenticated, upload.single("media"), postController.addPost);

router.get('/getPosts', isAuthenticated, postController.getPostByUserId);

router.delete("/delete", isAuthenticated, postController.deletePost);

export default router;
