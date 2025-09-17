import { RequestHandler } from "express";
import * as notificationService from "../services/notificationService";

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
    const { userId } = req.query;
    await notificationService.clearNotifications(userId as string);
    res.status(200).json({ message: "Notifications cleared" });
  } catch (err) {
    next(err);
  }
};

export const readNotifications: RequestHandler = async (req, res, next) => {
  try {
    console.log("calling read notification");
    const { id } = req.query;
    console.log("id",id);
    await notificationService.readNotification(id as string);
    res.status(200).json({ message: "Notifications read and cleared" });
  } catch (err) {
    next(err);
  }
};

