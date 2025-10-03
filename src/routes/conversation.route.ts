// routes/conversationRoutes.ts
import express from "express";
import * as conversationController from "../controllers/conversationController";
import * as messageController from "../controllers/messageController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = express.Router();

// Get all conversations
router.get("/", isAuthenticated, conversationController.getUserConversations);

// Create new conversation
router.post("/", isAuthenticated, conversationController.createConversation);

// Delete conversation
router.delete("/:conversationId", isAuthenticated, conversationController.deleteConversation);

export default router;
