// sockets/authSocket.ts
import { Server, Socket } from "socket.io";
import { getIO, onlineUsers } from "../utils/socketUtils";
import cookie from 'cookie';
import { verifyToken } from "../utils/jwtUtils";
import Message from "../models/message";
import { MessageStatus } from "../interfaces/IMessage";
import { markMessagesDelivered, updateMessageStatus } from "../services/messageService";

export default function registerAuthSocket(io: Server) {
  // Middleware to verify JWT from HttpOnly cookie
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("No cookies found in request"));
      }

      // Parse cookies
      const cookies = cookie.parse(cookieHeader);
      const token = cookies.jwt; // Our cookie name is 'jwt'

      if (!token) {
        return next(new Error("No JWT found in cookies"));
      }

      // Verify token using your helper
      const decoded = verifyToken(token) as { userId: string; email: string };

      // Attach user info to socket
      (socket as any).user = decoded;

      next();
    } catch (err) {
      console.error("Socket Auth Error:", err);
      next(new Error("Authentication error"));
    }
  });


  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);
    const user = (socket as any).user;
    console.log(`Socket connected for user ${user.userId}`);

    // When a user registers themselves (logs in on this socket)
    socket.on("register", async () => {
      // Add socket.id to this user's set
      console.log("register event called:");
      const userId = user.userId;
      console.log("userId:", userId);
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)?.add(socket.id);

      socket.join(userId); // For sending notifications/messages directly
      console.log(`User ${userId} connected. Active sockets:`, onlineUsers.get(userId));
      console.log("oneline user:", onlineUsers);
      // Notify other users that this user is online
      io.emit("userOnline", { userId });

      await markMessagesDelivered(io, userId);
    });

    socket.on("logout", () => {
      const userId = user.userId;
      console.log("at logout event");
      console.log("userId:", userId);
      if (onlineUsers.has(userId)) {
        const sockets = onlineUsers.get(userId);
        if (sockets) sockets.delete(socket.id);

        if (sockets?.size === 0) {
          onlineUsers.delete(userId);
          io.emit("userOffline", { userId });
        }
        console.log("online users: ", onlineUsers);
      }
      socket.disconnect();
    });

    socket.on("getOnlineUsers", (callback: (users: string[]) => void) => {
      console.log("at getOnlineUser event");
      console.log("online users: ", onlineUsers);
      callback(Array.from(onlineUsers.keys()));
    });

    // When a socket disconnects
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      console.log("online users: ", onlineUsers);
      // Find which user this socket belonged to
      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          // If no sockets left, user is fully offline
          console.log("socket size:", sockets.size);

          if (sockets.size === 0) {
            console.log(`User ${userId} is now offline`);
            onlineUsers.delete(userId);
            io.emit("userOffline", { userId });
          }
          break;
        }
      }
    });

    // Join conversation room
    socket.on("joinConversation", (conversationId: string) => {
      socket.join(conversationId);

      // Mark all delivered messages as delivered
      updateMessageStatusForConversation(conversationId, user.userId, MessageStatus.SEEN);
    });

    // Leave room when leaving conversation
    socket.on("leaveConversation", (conversationId: string) => {
      socket.leave(conversationId);
    });

  });
}


// Helper to mark all sent messages in a conversation as delivered
const updateMessageStatusForConversation = async (conversationId: string, userId: string, status: MessageStatus.SEEN) => {
  const io = getIO();
  const messages: any = await Message.find({ conversationId, status: MessageStatus.DELIVERED, sender: { $ne: userId } });
  for (const msg of messages) {
    msg.status = status;
    // if (status === "delivered") msg.deliveredTo.push(userId);
    if (status === MessageStatus.SEEN) msg.seenBy.push(userId);
    await msg.save();
    io.to(conversationId).emit("messageStatusUpdated", { messageId: msg._id, status, userId });
  }
};