import { RequestHandler } from "express";
import { userDetailDTO } from "../dtos/user/userDetailDTO";
import * as userService from "../services/userService";
import { AppError } from "../utils/errorUtils";
import { clearCookie } from "../utils/cookieUtils";

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

export const searchUsersController: RequestHandler = async (req, res, next) => {
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
