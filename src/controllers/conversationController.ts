import { RequestHandler } from "express";
import * as conversationService from "../services/conversationService";

/**
 * GET all conversations of a user
 */
export const getUserConversations: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    console.log("userId",userId);
    const conversations = await conversationService.getUserConversations(userId);
    console.log(conversations);
    res.json({ success: true, conversations });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**
 * POST Create a new conversation
 */
export const createConversation: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    const { participantId, type } = req.body;

    if (!participantId) {
      return res.status(400).json({ success: false, message: "participantId is required" });
    }

    const conversation = await conversationService.createConversation(userId, participantId, type);

    res.status(201).json({ success: true, conversation });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**
 * DELETE a conversation
 */
export const deleteConversation: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    await conversationService.deleteConversation(userId, conversationId);

    res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
