// import { Server, Socket } from "socket.io";

// interface ConnectedUser {
//   userId: string;
//   socketId: string;
// }

// let connectedUsers: ConnectedUser[] = [];

// export default function registerNotificationSocket(io: Server) {
//   io.on("connection", (socket: Socket) => {
//     console.log("User connected:", socket.id);

//     // When user logs in and connects to socket
//     socket.on("register", (userId: string) => {
//       connectedUsers.push({ userId, socketId: socket.id });
//       console.log(`User ${userId} registered for notifications`);
//     });

//     // Send real-time notification to a specific user
//     socket.on("sendNotification", ({ toUserId, notification }) => {
//       const target = connectedUsers.find((u) => u.userId === toUserId);
//       if (target) {
//         io.to(target.socketId).emit("newNotification", notification);
//       }
//     });

//     // When user disconnects
//     socket.on("disconnect", () => {
//       connectedUsers = connectedUsers.filter((u) => u.socketId !== socket.id);
//       console.log("User disconnected:", socket.id);
//     });
//   });
// }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// connected user based approach

// // src/sockets/notificationSocket.ts
// import { Server, Socket } from "socket.io";

// interface ConnectedUser {
//   userId: string;
//   socketId: string;
// }

// let connectedUsers: ConnectedUser[] = [];

// export default function registerNotificationSocket(io: Server) {
//   io.on("connection", (socket: Socket) => {
//     console.log("User connected:", socket.id);

//     // Register a user when they log in
//     socket.on("register", (userId: string) => {
//       connectedUsers.push({ userId, socketId: socket.id });
//       console.log(`User ${userId} registered for notifications`);
//     });

//     // Send real-time notification
//     socket.on("sendNotification", ({ toUserId, notification }) => {
//       const target = connectedUsers.find(u => u.userId === toUserId);
//       if (target) {
//         io.to(target.socketId).emit("newNotification", notification);
//       }
//     });

//     // Clean up on disconnect
//     socket.on("disconnect", () => {
//       connectedUsers = connectedUsers.filter(u => u.socketId !== socket.id);
//       console.log("User disconnected:", socket.id);
//     });
//   });
// }

// // Helper to find user and emit notification
// export const emitToUser = (io: Server, toUserId: string, notification: any) => {
//   const target = connectedUsers.find(u => u.userId === toUserId);
//   if (target) {
//     io.to(target.socketId).emit("newNotification", notification);
//   }
// };



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
