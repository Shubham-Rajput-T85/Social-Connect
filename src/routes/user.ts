import { Router } from "express";
import { upload } from "../middleware/upload";
import * as userValidator from "../validators/userValidator";
import { validate } from "../middleware/inputValidation";
import * as userController from "../controllers/userController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

// update user profile
router.put("/updateUserProfile", isAuthenticated, upload.single("profilePic"), userValidator.updateUserProfileValidation, validate, userController.updateUserProfile);

// delete user account
router.delete("/delete", isAuthenticated, userController.deleteUser);

// get user by search parameter
router.get("/getUsers", isAuthenticated, userController.searchUsersController);


// User Follow related Routes

// Get follow state
router.get("/state", isAuthenticated, userController.getFollowStateController);

// Follow a user
router.post("/follow", isAuthenticated, userController.followUserController);

// Unfollow a user
router.post("/unfollow", isAuthenticated, userController.unfollowUserController);

// Accept follow request
router.post("/accept", isAuthenticated, userController.acceptFollowRequestController);

// Reject follow request
router.post("/reject", isAuthenticated, userController.rejectFollowRequestController);

export default router;