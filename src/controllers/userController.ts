import { RequestHandler } from "express";
import { userDetailDTO } from "../dtos/user/userDetailDTO";
import * as userService from "../services/userService";
import { AppError } from "../utils/errorUtils";
import { clearCookie } from "../utils/cookieUtils";

/**
 * Update user profile
 * PUT /user/updateUserProfile
 * Body: { user }
 */
export const updateUserProfile: RequestHandler = async (req, res, next) => {
    try {
        console.log("here");
        
        const userDetails: userDetailDTO = {...req.body, profileUrl: req.file ? `/uploads/${req.file.filename}` : ""};

        if (!userDetails.name || !userDetails.username || !userDetails.id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await userService.updateUserDetails(userDetails);
        if (!result.success) {
            throw new AppError(result.message || "error occured while updating profile");
        }
        console.log(result);

        return res.status(201).json({
            user: result.user
          });

    }
    catch (err) {
        console.error(err);
        console.log(err);
        next(err);
    }
}

/**
 * Delete a user
 * DELETE /user/delete
 * Param: { userId }
 */
export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const { userId } : any = req.query;

        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        console.log(userId);
        
        const result = await userService.deleteUser(userId);
        if (!result.success) {
            throw new AppError(result.message || "error occured while deleting user");
        }
        // clear http only cookie
        clearCookie(res, "jwt");

        console.log("here");
        return res.status(200).json({ success: true, message: "Account deleted successfully" });
    }
    catch (err) {
        console.error(err);
        console.log(err);
        next(err);
    }
}

/**
 * Search a user
 * GET /user/getUsers
 * Param: { query, userId }
 */
export const searchUsers: RequestHandler = async (req, res, next) => {
  try {
    const { query, userId } = req.query as {
      query: string;
      userId: string;
    };

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "Current user ID is required" });
    }

    const users = await userService.searchUsers(query, userId);

    console.log(users);
    
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Search error:", error);
    next(new AppError("Error while searching users", 500));
  }
};

/**
 * Get the follow state between current user and target user
 * GET /user/state?currentUserId=...&targetUserId=...
 */
export const getFollowStateController: RequestHandler = async (req, res, next) => {
    try {
        const { currentUserId, targetUserId } = req.query as { currentUserId: string; targetUserId: string };

        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const state = await userService.getFollowState(currentUserId, targetUserId);
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
export const followUserController: RequestHandler = async (req, res, next) => {
    try {
        const { currentUserId, targetUserId } = req.body;

        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await userService.followUser(currentUserId, targetUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to follow user", 500));
    }
};

/**
 * Accept a follow request
 * POST /user/follow/accept
 * Body: { targetUserId, requesterUserId }
 */
export const acceptFollowRequestController: RequestHandler = async (req, res, next) => {
    try {
        const { targetUserId, requesterUserId } = req.body;

        if (!targetUserId || !requesterUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await userService.acceptFollowRequest(targetUserId, requesterUserId);
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
export const unfollowUserController: RequestHandler = async (req, res, next) => {
    try {
        const { currentUserId, targetUserId } = req.body;
        
        
        if (!currentUserId || !targetUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await userService.unfollowUser(currentUserId, targetUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to unfollow user", 500));
    }
};

/**
 * Reject a follow request
 * POST /user/follow/reject
 * Body: { targetUserId, requesterUserId }
 */
export const rejectFollowRequestController: RequestHandler = async (req, res, next) => {
    try {
        // const { targetUserId, requesterUserId } = req.body;

        // if (!targetUserId || !requesterUserId) {
        //     return res.status(400).json({ message: "Missing required fields" });
        // }
        // const result = await userService.rejectFollowRequest(targetUserId, requesterUserId);
        const { targetUserId, currentUserId } = req.body;

        if (!targetUserId || !currentUserId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await userService.rejectFollowRequest(targetUserId, currentUserId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error(err);
        next(new AppError("Failed to reject follow request", 500));
    }
};
