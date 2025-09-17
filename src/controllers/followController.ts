import { RequestHandler } from "express";
import * as followService from "../services/followService";
import { AppError } from "../utils/errorUtils";
import { notificationDTO } from "../dtos/notificationDTO";
import { triggerNotification } from "../services/notificationService";


/**
 * Get the follow state between current user and target user
 * GET /user/followState?currentUserId=...&targetUserId=...
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

        if(result.success && result?.isPrivate){
            const notificationData: notificationDTO = {
                type: "followRequest",
                userId: targetUserId,
                senderUserId: currentUserId
              } 
              await triggerNotification(notificationData);
        }     

        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to follow user", 500));
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
 * Accept a follow request
 * POST /user/accept
 * Body: { targetUserId, currentUserId }
 */
export const acceptFollowRequest: RequestHandler = async (req, res, next) => {
    try {
        const { requesterUserId, targetUserId } = req.body;

        if (!requesterUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await followService.acceptFollowRequest(requesterUserId, targetUserId);

        if(result.success){
            const notificationData: notificationDTO = {
                type: "acceptedRequest",
                userId: requesterUserId,
                senderUserId: targetUserId
              } 
              await triggerNotification(notificationData);
        }

        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to accept follow request", 500));
    }
};

/**
 * Reject a follow request
 * POST /user/reject
 * Body: { targetUserId, currentUserId }
 */
export const rejectFollowRequest: RequestHandler = async (req, res, next) => {
    try {
        const { requesterUserId, targetUserId } = req.body;

        if (!requesterUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await followService.rejectFollowRequest(requesterUserId, targetUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to reject follow request", 500));
    }
};

/**
 * Cancel a follow request
 * POST /user/cancel
 * Body: { currentUserId, targetUserId }
 */
export const cancelFollowRequest: RequestHandler = async (req, res, next) => {
    try {
        const { currentUserId, targetUserId } = req.body;
        
        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await followService.rejectFollowRequest(currentUserId, targetUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to reject follow request", 500));
    }
};

/**
 * Gives list of followRequest user
 * GET /user/getFollowRequest
 * Param: { userId }
 */
export const getFollowRequestsList: RequestHandler = async (req, res, next) => {
    try {
        const { userId }: any = req.query;

        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const requests = await followService.getFollowRequestsList(userId);

        return res.status(200).json({
            followRequests: requests,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

/**
 * Gives list of followers user
 * GET /user/getFollowers
 * Param: { userId }
 */
export const getFollowersList: RequestHandler = async (req, res, next) => {
    try {
        const { userId }: any = req.query;
        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const requests = await followService.getFollowersList(userId);

        return res.status(200).json({
            followersList: requests,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

/**
 * Gives list of following user
 * GET /user/getFollowing
 * Param: { userId }
 */
export const getFollowingList: RequestHandler = async (req, res, next) => {
    try {
        const { userId }: any = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const requests = await followService.getFollowingList(userId);

        return res.status(200).json({
            followingList: requests,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};