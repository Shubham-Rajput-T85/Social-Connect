import express from "express";
import * as notificationController from "../controllers/notificationController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = express.Router();

// Get all notifications for a user
router.get("/", isAuthenticated, notificationController.getNotifications);

// Clear all notifications
router.delete("/clear", isAuthenticated, notificationController.clearNotifications);

// Mark notifications as read and clear them
router.patch("/read", isAuthenticated, notificationController.readNotifications);

export default router;
