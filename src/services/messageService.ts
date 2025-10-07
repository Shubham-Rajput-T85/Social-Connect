import { MessageStatus } from "../interfaces/IMessage";
import Conversation from "../models/conversation";
import Message from "../models/message";
import { getIO, isUserOnline } from "../utils/socketUtils";

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
  // 1️⃣ Get the conversation participants
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) throw new Error("Conversation not found");

  // 2️⃣ Exclude the sender
  const receiverIds = conversation.participants.filter(
    (id) => id.toString() !== sender.toString()
  );

  // 3️⃣ Check online status of all receivers
  const allOnline = receiverIds.length > 0 && receiverIds.every((id) => isUserOnline(id.toString()));

  // 4️⃣ Set message status based on online presence
  const status = allOnline ? MessageStatus.DELIVERED : MessageStatus.SENT;

  // 5️⃣ Optionally track who received it instantly
  const deliveredTo = allOnline ? receiverIds : receiverIds.filter((id) => isUserOnline(id.toString()));

  // 6️⃣ Create message
  const newMessage = await Message.create({
    conversationId,
    sender,
    text,
    status,
    deliveredTo,
  });

  await newMessage.populate("sender", "_id name username profileUrl");

  // 7️⃣ Update conversation last activity
  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

  // 8️⃣ Emit real-time event
  const io = getIO();
  io.to(conversationId).emit("newMessage", newMessage);

  return newMessage;
};

/**
 * Update message status
 */
export const updateMessageStatus = async (messageId: string, userId: string, status: MessageStatus) => {
  const updateField = status === MessageStatus.DELIVERED ? "deliveredTo" : "seenBy";

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { [updateField]: userId }, status },
    { new: true }
  );
  
  if (updatedMessage) {
    getIO().to(updatedMessage.conversationId.toString()).emit("messageStatusUpdated", {
      messageId,
      status,
      userId,
    });
  }

  return updatedMessage;
};


export const markMessagesDelivered = async (io: any, userId: string) => {
  try {
    // 1️⃣ Get all conversation IDs where this user is a participant
    const conversations = await Conversation.find({ participants: userId }, "_id").lean();
    const conversationIds = conversations.map(c => c._id);

    if (conversationIds.length === 0) return;

    // 2️⃣ Find all messages sent to this user (not sent by them)
    //    and not yet marked as delivered for this user
    const filter = {
      conversationId: { $in: conversationIds },
      sender: { $ne: userId },
      status: MessageStatus.SENT,
      deliveredTo: { $ne: userId },
    };

    // 3️⃣ Update all matching messages in bulk
    const result = await Message.updateMany(filter, {
      $addToSet: { deliveredTo: userId },
      $set: { status: MessageStatus.DELIVERED },
    });

    console.log(`Delivered ${result.modifiedCount} messages to user ${userId}`);

    // 4️⃣ Emit event for each updated message (optional but good for real-time updates)
    const updatedMessages = await Message.find({
      conversationId: { $in: conversationIds },
      deliveredTo: userId,
      status: MessageStatus.DELIVERED,
    }).lean();

    for (const msg of updatedMessages) {
      io.to(msg.conversationId.toString()).emit("messageStatusUpdated", {
        messageId: msg._id,
        status: MessageStatus.DELIVERED,
        userId,
      });
    }
  } catch (err) {
    console.error("Error marking messages as delivered:", err);
  }
};