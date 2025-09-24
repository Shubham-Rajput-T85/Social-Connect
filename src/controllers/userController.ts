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
        const userDetails: userDetailDTO = { ...req.body, profileUrl: req.file ? `/uploads/${req.file.filename}` : "" };

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
        const { userId }: any = req.query;

        if (!userId) {
            return res.status(403).json({ message: "Not authenticated" });
        }
        console.log(userId);

        const result = await userService.deleteUser(userId);
        if (!result.success) {
            throw new AppError(result.message || "error occured while deleting user");
        }
        // clear http only cookie
        clearCookie(res, "jwt");

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
            return res.status(403).json({ message: "Not authenticated" });
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
 * Get suggested friends
 * GET /user/suggestedFriends?userId=...
 */
export const getSuggestedFriends: RequestHandler = async (req: any, res, next) => {
    try {
        const currentUserId = req.user.userId;

        if (!currentUserId) {
            return res.status(403).json({ message: "Not authenticated" });
        }

        const suggestedUsers = await userService.getSuggestedFriends(currentUserId);

        return res.status(200).json({ users: suggestedUsers });
    } catch (error) {
        console.error("Suggested friends error:", error);
        next(new AppError("Error while fetching suggested friends", 500));
    }
};

/**
 * Get suggested friends
 * PATCH /user/updateAccountStatus
 */
export const togglePrivateState: RequestHandler = async (req: any, res, next) => {
    try {
        const currentUserId = req.user.userId;

        if (!currentUserId) {
            return res.status(403).json({ message: "Not authenticated" });
        }

        const response = await userService.togglePrivateState(currentUserId);

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error("private state error:", error);
        next(new AppError("Error while toggle private state", 500));
    }
}