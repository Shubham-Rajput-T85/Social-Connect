import { getIO } from "../utils/socketUtils";

export const emitNotification = (toUserId: string, notification: any) => {
  const io = getIO();
  io.to(notification.userId.toString()).emit("newNotification", notification);

  console.log("Backend emitted to room:",notification.userId.toString(), toUserId);
};