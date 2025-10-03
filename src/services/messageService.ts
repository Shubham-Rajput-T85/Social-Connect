import { MessageStatus } from "../interfaces/IMessage";
import Conversation from "../models/conversation";
import Message from "../models/message";
import { getIO } from "../utils/socketUtils";
import { emitUpdateMessageStatus } from "./socketService";

/**
 * Fetch messages with pagination
 */
export const getMessages = async (conversationId: string, page: number, limit: number) => {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("sender", "name username profileUrl")
    .lean();

  return messages.reverse();
};

/**
 * Send a new message
 */
export const sendMessage = async (conversationId: string, sender: string, text: string) => {
  const newMessage = await Message.create({
    conversationId,
    sender,
    text,
    status: MessageStatus.SENT,
  });

  await newMessage.populate("sender", "_id name username profileUrl");

  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

  const io = getIO();
  io.to(conversationId).emit("newMessage", newMessage);

  return newMessage;
};

/**
 * Update message status
 */
export const updateMessageStatus = async (messageId: string, userId: string, status: MessageStatus) => {
  if (!["delivered", "seen"].includes(status)) {
    throw new Error("Invalid status");
  }

  const updateField = status === MessageStatus.DELIVERED ? "deliveredTo" : "seenBy";

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: { [updateField]: userId },
      status,
    },
    { new: true }
  );

  emitUpdateMessageStatus(updatedMessage, status, userId);

  return updatedMessage;
};
