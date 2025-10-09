import { MessageStatus } from "../interfaces/IMessage";
import { getIO } from "../utils/socketUtils";

export const emitNotification = (toUserId: string, notification: any) => {
  const io = getIO();
  io.to(notification.userId.toString()).emit("newNotification", notification);
  console.log("Backend emitted to room:",notification.userId.toString(), toUserId);
};

export const emitUpdateMessageStatus = (updatedMessage: any, status: MessageStatus, userId: string) => {
  const io = getIO();
  io.to(updatedMessage?.conversationId.toString() || "").emit("messageStatusUpdated", {
    messageId: updatedMessage?._id,
    status,
    userId,
  });
};

export const emitEditMessage = (message: any) => {
  const io = getIO();
  io.to(message.conversationId.toString()).emit('messageUpdated', message);
}

export const emitNewMessage = (conversationId: string, newMessage: any) => {
  const io = getIO();
  io.to(conversationId).emit("newMessage", newMessage);
}

export const emitUserOnline = (userId: string) => {
  const io = getIO();
  io.emit("userOnline", { userId });
}

export const emitUserOffline = (userId: string) => {
  const io = getIO();
  io.emit("userOffline", { userId });
}