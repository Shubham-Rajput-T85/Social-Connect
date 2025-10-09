import { RequestHandler } from "express";
import * as messageService from "../services/messageService";

export const getMessages: RequestHandler = async (req: any, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page, limit } = req.query;
    console.log("page: limit: ",page,limit);
    const messages = await messageService.getMessages(conversationId, Number(page), Number(limit));

    res.json({
      success: true,
      messages,
      pagination: { page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const sendMessage: RequestHandler = async (req: any, res, next) => {
  try {
    const sender = req.user.userId;
    const { conversationId } = req.params;
    const { text } = req.body;

    const newMessage = await messageService.sendMessage(conversationId, sender, text);

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateMessageStatus: RequestHandler = async (req: any, res, next) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    console.log("called update message status");
    
    const updatedMessage = await messageService.updateMessageStatus(messageId, userId, status);

    res.json({ success: true, message: updatedMessage });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const editMessage: RequestHandler = async (req: any, res, next) => {
  try {
    const editorId = req.user.userId;
    const { messageId } = req.params;
    const { text } = req.body;

    const updatedMessage = await messageService.editMessage(messageId, editorId, text);

    res.json({ success: true, message: updatedMessage });
  } catch (err) {
    console.error(err);
    next(err);
  }
};