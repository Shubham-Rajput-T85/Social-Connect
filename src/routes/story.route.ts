import { Router } from "express";
import * as storyController from "../controllers/storyController";
import { upload } from "../middleware/upload";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

// Add Story
router.post("/add", isAuthenticated, upload.single("media"), storyController.addStory);

// Get Story Feed (self + following)
router.get("/feed", isAuthenticated, storyController.getStoriesFeed);

// View a Story
router.post("/:storyId/view", isAuthenticated, storyController.viewStory);

// Delete a Story
router.delete("/:storyId/delete", isAuthenticated, storyController.deleteStory);

export default router;
