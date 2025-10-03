// sockets/authSocket.ts
import { Server, Socket } from "socket.io";
import { onlineUsers } from "../utils/socketUtils";
import cookie from 'cookie';
import { verifyToken } from "../utils/jwtUtils";

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
    socket.on("register", () => {
      // Add socket.id to this user's set
      const userId = user.userId;
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)?.add(socket.id);

      socket.join(userId); // For sending notifications/messages directly
      console.log(`User ${userId} connected. Active sockets:`, onlineUsers.get(userId));
      
      // Notify other users that this user is online
      io.emit("userOnline", { userId });
    });

    socket.on("logout", () => {
      const userId = user.userId;
      if (onlineUsers.has(userId)) {
        const sockets = onlineUsers.get(userId);
        if (sockets) sockets.delete(socket.id);
    
        if (sockets?.size === 0) {
          onlineUsers.delete(userId);
          io.emit("userOffline", { userId });
        }
      }
    });

    socket.on("getOnlineUsers", (callback: (users: string[]) => void) => {
      callback(Array.from(onlineUsers.keys()));
    });

    // When a socket disconnects
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      console.log(onlineUsers);
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

    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("userTyping", { conversationId, userId: user.userId });
    });
    
    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(conversationId).emit("userStopTyping", { conversationId, userId: user.userId });
    });
  });
}
