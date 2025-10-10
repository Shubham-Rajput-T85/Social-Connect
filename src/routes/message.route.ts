import { Router } from "express";
import * as messageController from "../controllers/messageController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

// Get paginated messages for a conversation
// GET /api/messages/:conversationId?page=1&limit=20
router.get("/:conversationId", isAuthenticated, messageController.getMessages);

// Send a new message in a conversation
// POST /messages/:conversationId
router.post("/:conversationId", isAuthenticated, messageController.sendMessage);

// Update message status (read/delivered/etc.)
// PATCH /messages/status/:messageId
router.patch("/status/:messageId", isAuthenticated, messageController.updateMessageStatus);

// Update message text 
// PATCH /messages/edit/:messageId
router.patch("/edit/:messageId", isAuthenticated, messageController.editMessage);

// delete message
// DELETE /messages/delete/:messageId
router.delete("/delete/:messageId", isAuthenticated, messageController.deleteMessage);

export default router;
