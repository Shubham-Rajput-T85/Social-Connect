import { notificationDTO } from "../dtos/notificationDTO";
import Notification from "../models/notification";
import * as socketService from "../services/socketService";

export const createNotification = async (data: notificationDTO) => {
  return Notification.create(data);
};

export const getUserNotifications = async (userId: string) => {
  return Notification.find({ userId })
    .populate("senderUserId", "name username profileUrl")
    .sort({ createdAt: -1 });
};

export const clearNotifications = async (userId: string) => {
  return Notification.deleteMany({ userId });
};

export const readNotification = async (notificationId: string) => {
  return Notification.deleteOne({ _id: notificationId });
};

export const triggerNotification = async (notificationData: notificationDTO) => {
  // 1. Create notification in DB
  const notification = await createNotification(notificationData);
  console.log("notification",notification);
  
  // 2. Emit real-time socket event
  socketService.emitNotification(notification.userId.toString(), notification);
}