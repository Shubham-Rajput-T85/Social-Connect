// sockets/authSocket.ts
import { Server, Socket } from "socket.io";
import { onlineUsers } from "../utils/socketUtils";

export default function registerAuthSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    // When a user registers themselves (logs in on this socket)
    socket.on("register", (userId: string) => {
      // Add socket.id to this user's set
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)?.add(socket.id);

      socket.join(userId); // For sending notifications/messages directly
      console.log(`User ${userId} connected. Active sockets:`, onlineUsers.get(userId));
      
      // Notify other users that this user is online
      io.emit("userOnline", { userId });
    });

    socket.on("logout", (userId) => {
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

      // Find which user this socket belonged to
      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);

          // If no sockets left, user is fully offline
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
            io.emit("userOffline", { userId });
            console.log(`User ${userId} is now offline`);
          }
          break;
        }
      }
    });
  });
}
