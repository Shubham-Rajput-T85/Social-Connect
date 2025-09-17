// Room based approach, 

import { Server, Socket } from "socket.io";

export default function registerNotificationSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    // Register the user and join a room
    socket.on("register", (userId: string) => {
      socket.join(userId); // each user has a room named after their userId
      console.log(`User ${userId} joined room`);
    });

    // Optional: handle user leaving or disconnecting
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, "Reason:", reason);
    });
  });
}
