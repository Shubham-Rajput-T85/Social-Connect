import Conversation from "../models/conversation";
import Message from "../models/message";
import { isUserOnline } from "../utils/socketUtils";

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string) => {
  const conversations = await Conversation.find({ participants: userId })
    .populate("participants", "username profileUrl")
    .sort({ updatedAt: -1 })
    .lean();

  console.log(conversations);
  
  return Promise.all(
    conversations.map(async (conv: any) => {
      const otherUser = conv.participants.find((p: any) => p._id.toString() !== userId);

      const lastMessage = await Message.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .lean();

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        sender: { $ne: userId },
        seenBy: { $ne: userId },
      });

      const now = new Date();

      return {
        conversationId: conv._id,
        user: {
          _id: otherUser._id,
          username: otherUser.username,
          name: otherUser.name,
          profileUrl: otherUser.profileUrl,
          online: isUserOnline(otherUser._id.toString()),
          storyCount: otherUser.storyCount
        },
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              createdAt: lastMessage.createdAt,
              status: lastMessage.status,
            }
          : null,
        unreadCount,
      };
    })
  );
};

/**
 * Create a new conversation
 */
export const createConversation = async (
  userId: string,
  participantId: string,
  type = "direct"
) => {
  // Check if a direct conversation already exists (order doesn’t matter)
  const existingConversation = await Conversation.findOne({
    participants: { $all: [userId, participantId] },
    type,
  });

  if (existingConversation) {
    return existingConversation; // Just return it if it exists
  }

  // Otherwise, create a new one
  const conversation = await Conversation.create({
    participants: [userId, participantId], // order doesn’t matter because we always query with $all
    type,
  });

  return conversation;
};

/**
 * Delete a conversation (and all messages)
 */
export const deleteConversation = async (userId: string, conversationId: string) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Ensure user is part of the conversation
  if (!conversation.participants.includes(userId as any)) {
    throw new Error("Not authorized to delete this conversation");
  }

  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  return true;
};

/**
 * Find and delete a direct conversation between two users
 */
export const findAndDeleteConversation = async (
  currentUserId: string,
  participantUserId: string
) => {
  // Find direct conversation between the two users
  const conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, participantUserId] },
    type: "direct",
  });

  if (!conversation) {
    console.log("Direct conversation not found");
    // throw new Error("Direct conversation not found");
    return;
  }

  // Ensure currentUserId is actually part of this conversation
  if (!conversation.participants.includes(currentUserId as any)) {
    throw new Error("Not authorized to delete this conversation");
  }

  // Delete all messages and the conversation
  await Message.deleteMany({ conversationId: conversation._id });
  await Conversation.findByIdAndDelete(conversation._id);

  return true;
};