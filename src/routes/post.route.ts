import { Router } from "express";
import * as postController from "../controllers/postController";
import * as likeFeatureController from "../controllers/likeFeatureController";
import * as commentsController from "../controllers/commentsController";
import { upload } from "../middleware/upload";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

// Post crud

router.post('/addPost', isAuthenticated, upload.single("media"), postController.addPost);

router.get('/feed/myPost', isAuthenticated, postController.getMyPostFeed);

router.get('/getPosts/:userId', isAuthenticated, postController.getPostByUser);

router.get('/feed/home', isAuthenticated, postController.getHomeFeedPost);

router.delete("/delete", isAuthenticated, postController.deletePost);

//

// Like Feature

router.post("/:postId/like", isAuthenticated, likeFeatureController.likePost);

router.post("/:postId/like/undo", isAuthenticated, likeFeatureController.undoLikePost);

router.get("/:postId/like/getUser", isAuthenticated, likeFeatureController.getUsersWhoLikePost);

router.post("/:postId/isLike", isAuthenticated, likeFeatureController.didCurrentUserLikePost);

//

// Comment Feature 
router.get("/:postId/comments", isAuthenticated, commentsController.getComments);

router.post("/:postId/comments/add", isAuthenticated, commentsController.addComment);

router.delete("/:postId/comments/delete/:commentId", isAuthenticated, commentsController.deleteComment);

// Edit a comment
router.patch("/:postId/comments/edit/:commentId", isAuthenticated, commentsController.editComment);


//

export default router;