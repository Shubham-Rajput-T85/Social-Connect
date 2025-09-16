// // services/socketService.ts
// import { io } from "../utils/socketUtils";

// export const emitNotification = (toUserId: string, notification: any) => {
//   // Emit to a specific room = user's ID
//   io.to(toUserId).emit("sendNotification", notification);
// };




// // src/services/socketService.ts
// import { getIO } from "../utils/socketUtils";
// import { emitToUser } from "../sockets/notificationSocket";

// export const emitNotification = (toUserId: string, notification: any) => {
//   const io = getIO();
//   emitToUser(io, toUserId, notification);
// };

// connected user based approach
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/// room based approach



// src/services/socketService.ts
import { getIO } from "../utils/socketUtils";

export const emitNotification = (toUserId: string, notification: any) => {
  const io = getIO();
  io.to(notification.userId.toString()).emit("newNotification", notification);

  console.log("Backend emitted to room:",notification.userId.toString(), toUserId);
};