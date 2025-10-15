import { RequestHandler } from "express";
import * as storyService from "../services/storyService";

export const addStory: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    const caption = req.body.caption || "";
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : "";

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        alertType: "error",
        message: "Media file is required",
      });
    }

    const story = await storyService.addStory(userId, caption, mediaUrl);
    return res.status(201).json({
      success: true,
      alertType: "success",
      message: "Story added successfully",
      story,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getStoriesFeed: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user.userId;
    const stories = await storyService.getStoriesFeed(userId);
    return res.status(200).json({
      success: true,
      alertType: "info",
      message: stories.length
        ? "Stories fetched successfully"
        : "No active stories found",
      stories,
    });
  } catch (err) {
    next(err);
  }
};

export const viewStory: RequestHandler = async (req: any, res, next) => {
  try {
    const viewerId = req.user.userId;
    const { storyId } = req.params;

    const story = await storyService.viewStory(storyId, viewerId);
    return res.status(200).json({
      success: true,
      alertType: "info",
      message: "Story viewed successfully",
      story,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStory: RequestHandler = async (req: any, res, next) => {
  try {
    const { storyId } = req.params;
    const currentUserId = req.user.userId;

    const response = await storyService.deleteStory(storyId, currentUserId);
    return res.status(200).json({
      success: true,
      alertType: "warning",
      message: response.message,
    });
  } catch (err) {
    next(err);
  }
};
