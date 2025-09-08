import { RequestHandler } from "express";
import { userDetailDTO } from "../dtos/user/userDetailDTO";
import * as userService from "../services/userService";
import { AppError } from "../utils/errorUtils";

export const updateUserProfile: RequestHandler = async (req, res, next) => {
    try {
        console.log("here");
        
        const userDetails: userDetailDTO = req.body;

        if (!userDetails.name || !userDetails.username || !userDetails.id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await userService.updateUserDetails(userDetails);
        if (!result.success) {
            throw new AppError(result.message || "error occured while updating profile");
        }
    }
    catch (err) {
        console.error(err);
        console.log(err);
        next(err);
    }
}

export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const userId: string = req.body.id;

        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await userService.deleteUser(userId);
        if (!result.success) {
            throw new AppError(result.message || "error occured while deleting user");
        }
    }
    catch (err) {
        console.error(err);
        console.log(err);
        next(err);
    }
}