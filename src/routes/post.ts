import { Router } from "express";
import * as postController from "../controllers/postController";
import * as likeFeatureController from "../controllers/likeFeatureController";
import { upload } from "../middleware/upload";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

router.post('/addPost', isAuthenticated, upload.single("media"), postController.addPost);

router.get('/feed/myPost', isAuthenticated, postController.getPostsByUserId);

router.get('/feed/home', isAuthenticated, postController.getHomeFeedPost);

router.delete("/delete", isAuthenticated, postController.deletePost);

router.post("/:postId/like", isAuthenticated, likeFeatureController.likePost);

router.post("/:postId/like/undo", isAuthenticated, likeFeatureController.undoLikePost);

router.get("/:postId/like/getUser", isAuthenticated, likeFeatureController.getUsersWhoLikePost);

router.post("/:postId/isLike", isAuthenticated, likeFeatureController.didCurrentUserLikePost);

export default router;