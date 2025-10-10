import { MessageStatus } from "../interfaces/IMessage";
import Conversation from "../models/conversation";
import Message from "../models/message";
import { getIO, isUserOnline, onlineUsers } from "../utils/socketUtils";
import { emitEditMessage, emitMessageDeleted, emitMessageNotification, emitNewMessage, emitUpdateMessageStatus } from "./socketService";

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
  // 1️⃣ Fetch conversation
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) throw new Error("Conversation not found");

  // 2️⃣ Exclude sender
  const receiverIds = conversation.participants.filter(
    (id) => id.toString() !== sender.toString()
  );

  // 3️⃣ Check who’s online
  const allOnline =
    receiverIds.length > 0 && receiverIds.every((id) => isUserOnline(id.toString()));
  const deliveredTo = receiverIds.filter((id) => isUserOnline(id.toString()));

  const status = allOnline ? MessageStatus.DELIVERED : MessageStatus.SENT;

  // 4️⃣ Create the message
  const newMessage = await Message.create({
    conversationId,
    sender,
    text,
    status,
    deliveredTo,
  });

  await newMessage.populate("sender", "_id name username profileUrl");

  // 5️⃣ Emit to the conversation room
  emitNewMessage(conversationId, newMessage);

  // 6️⃣ Find which online users are *not* in the active chat room
  const io = getIO();
  const roomSockets = io.sockets.adapter.rooms.get(conversationId) || new Set();

  const onlineNotInRoom = receiverIds.filter((userId) => {
    if (!isUserOnline(userId.toString())) return false;

    const sockets = onlineUsers.get(userId.toString());
    if (!sockets || sockets.size === 0) return false;

    // ✅ Check if any of the user's sockets are in the chat room
    const isInRoom = Array.from(sockets).some((socketId) => roomSockets.has(socketId));
    return !isInRoom;
  });

  console.log("onlineNotInRoom:", onlineNotInRoom);

  // 7️⃣ Emit notifications only to those not viewing this conversation
  onlineNotInRoom.forEach((userId) => {
    emitMessageNotification(userId.toString(), {
      conversationId,
    });
  });

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
  message.editedAt = new Date();

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

  await message.populate('sender', '_id name username profileUrl');

  // 9️⃣ Emit real-time events
  emitUpdateMessageStatus(message, message.status, editorId);
  emitEditMessage(message);

  return message;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string, deleterId: string) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message not found");

  // Only the sender can delete (for now)
  if (message.sender.toString() !== deleterId.toString()) {
    throw new Error("Not authorized to delete this message");
  }

  // ✅ Emit delete event BEFORE permanent deletion
  emitMessageDeleted({
    _id: message._id,
    conversationId: message.conversationId,
    sender: message.sender,
  });

  // ✅ Permanently delete the message from DB
  await message.deleteOne();

  return { success: true };
};