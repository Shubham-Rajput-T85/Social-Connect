import { RequestHandler } from "express";
import * as followService from "../services/followService";
import { AppError } from "../utils/errorUtils";


/**
 * Get the follow state between current user and target user
 * GET /user/state?currentUserId=...&targetUserId=...
 */
export const getFollowState: RequestHandler = async (req, res, next) => {
    try {
        const { currentUserId, targetUserId } = req.query as { currentUserId: string; targetUserId: string };

        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const state = await followService.getFollowState(currentUserId, targetUserId);
        return res.status(200).json({ state: state });
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to get follow state", 500));
    }
};

/**
 * Follow a user
 * POST /user/follow
 * Body: { currentUserId, targetUserId }
 */
export const followUser: RequestHandler = async (req, res, next) => {
    try {
        const { currentUserId, targetUserId } = req.body;

        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await followService.followUser(currentUserId, targetUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to follow user", 500));
    }
};

/**
 * Accept a follow request
 * POST /user/follow/accept
 * Body: { targetUserId, currentUserId }
 */
export const acceptFollowRequest: RequestHandler = async (req, res, next) => {
    try {
        const { targetUserId, currentUserId } = req.body;

        if (!targetUserId || !currentUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await followService.acceptFollowRequest(targetUserId, currentUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to accept follow request", 500));
    }
};

/**
 * Unfollow a user
 * POST /user/unfollow
 * Body: { currentUserId, targetUserId }
 */
export const unfollowUser: RequestHandler = async (req, res, next) => {
    try {
        const { currentUserId, targetUserId } = req.body;


        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await followService.unfollowUser(currentUserId, targetUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to unfollow user", 500));
    }
};

/**
 * Reject a follow request
 * POST /user/follow/reject
 * Body: { targetUserId, currentUserId }
 */
export const rejectFollowRequest: RequestHandler = async (req, res, next) => {
    try {
        const { targetUserId, currentUserId } = req.body;

        if (!targetUserId || !currentUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await followService.acceptFollowRequest(currentUserId, targetUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to reject follow request", 500));
    }
};



export const getFollowRequests: RequestHandler = async (req, res, next) => {
    try {
        const { userId }: any = req.query;

        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const requests = await followService.getFollowRequests(userId);

        return res.status(200).json({
            followRequests: requests,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};