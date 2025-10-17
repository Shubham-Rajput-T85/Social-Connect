import { RequestHandler } from "express";
import * as storyService from "../services/storyService";
import * as followService from "../services/followService";

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

export const getStoriesFeedByUser: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const currentUserId = req.user.userId;
    const isCurrentUser = userId === currentUserId;
    if (!userId) {
      return res.status(400).json({ success: false, alertType: "error", message: "Bad request, user missing" });
    }
    const isFollowing = await followService.isFollowing(currentUserId, userId);
    const isFollower = await followService.isFollower(currentUserId, userId);
    const isUserAuthorized = (userId === currentUserId) || isFollowing || isFollower;

    if (!isUserAuthorized) {
      return res.status(403).json({
        success: false,
        alertType: "error",
        message: "Not Authorized to see story"
      });
    }
    
    const stories = await storyService.getStoriesFeed(userId, isCurrentUser);
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