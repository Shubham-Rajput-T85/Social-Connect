import { RequestHandler } from "express";
import * as notificationService from "../services/notificationService";
import * as socketService from "../services/socketService";
import { notificationDTO } from "../dtos/notificationDTO";

export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const notifications = await notificationService.getUserNotifications(userId as string);
    res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
};

export const clearNotifications: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.body;
    await notificationService.clearNotifications(userId);
    res.status(200).json({ message: "Notifications cleared" });
  } catch (err) {
    next(err);
  }
};

export const readNotifications: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.body;
    await notificationService.readNotification(userId);
    res.status(200).json({ message: "Notifications read and cleared" });
  } catch (err) {
    next(err);
  }
};

