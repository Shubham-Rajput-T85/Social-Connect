import { MessageStatus } from "../interfaces/IMessage";
import Conversation from "../models/conversation";
import Message from "../models/message";
import { isUserOnline } from "../utils/socketUtils";
import { emitNewMessage, emitUpdateMessageStatus } from "./socketService";

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

  // 8️⃣ Emit real-time event
  emitNewMessage(conversationId, newMessage);

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
    emitUpdateMessageStatus(updatedMessage, status, userId);
  }

  return updatedMessage;
};


export const markMessagesDelivered = async (userId: string) => {
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
      emitUpdateMessageStatus(msg, MessageStatus.DELIVERED, userId);
    }
  } catch (err) {
    console.error("Error marking messages as delivered:", err);
  }
};


// export const markMessageStatusSeenForConversation = async (conversationId: string, userId: string, status: MessageStatus.SEEN) => {
//   const messages: any = await Message.find({ conversationId, status: MessageStatus.DELIVERED, sender: { $ne: userId } });

//   for (const msg of messages) {
//     msg.status = status;

//     if (status === MessageStatus.SEEN) msg.seenBy.push(userId);

//     await msg.save();
//     emitUpdateMessageStatus(msg, status, userId );
//   }
// };

export const markMessageStatusSeenForConversation = async (conversationId: string, userId: string) => {
  console.time(`markMessageStatusSeenForConversation:${conversationId}`); // ⏱ start timer

  const messages: any = await Message.find({ conversationId, sender: { $ne: userId } });

  const conv: any = await Conversation.findById(conversationId).lean();

  await Promise.all(messages.map(async (msg: any) => {
    if (!msg.seenBy.includes(userId)) msg.seenBy.push(userId);

    const allSeen = conv.participants
      .filter((p: any) => p.toString() !== msg.sender.toString())
      .every((p: any) => msg.seenBy.map((id: any) => id.toString()).includes(p.toString()));

    if (allSeen) msg.status = MessageStatus.SEEN;

    await msg.save();
    emitUpdateMessageStatus(msg, MessageStatus.SEEN, userId);
  }));

  console.timeEnd(`markMessageStatusSeenForConversation:${conversationId}`); // ⏹ end timer
};


/**
 * Edit a message text
 */
export const editMessage = async (messageId: string, editorId: string, newText: string) => {
  // 1️⃣ Fetch the message
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message not found");

  // 2️⃣ Only sender can edit their message
  if (message.sender.toString() !== editorId.toString()) {
    throw new Error("Not authorized to edit this message");
  }

  // 3️⃣ Update message text and optional edited timestamp
  message.text = newText;

  // 4️⃣ Fetch conversation participants
  const conv = await Conversation.findById(message.conversationId).lean();
  if (!conv) throw new Error("Conversation not found");

  const otherParticipants = conv.participants.filter(
    (p) => p.toString() !== editorId.toString()
  );

  // 5️⃣ Determine which participants are online
  const deliveredToNow = otherParticipants.filter((p) => isUserOnline(p.toString()));

  // 6️⃣ Reset delivery and seen tracking for others
  message.deliveredTo = deliveredToNow;
  message.seenBy = message.seenBy?.filter((id) =>
    !otherParticipants.map((p) => p.toString()).includes(id.toString())
  );

  // 7️⃣ Update message status
  message.status = deliveredToNow.length === otherParticipants.length
    ? MessageStatus.DELIVERED
    : MessageStatus.SENT;

  // 8️⃣ Save the updated message
  await message.save(); // ✅ updatedAt auto-updated due to timestamps:true

  // 9️⃣ Emit real-time events
  emitNewMessage(message.conversationId.toString(), message);
  emitUpdateMessageStatus(message, message.status, editorId);

  return message;
};