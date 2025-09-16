import { Router } from "express";
import { upload } from "../middleware/upload";
import * as userValidator from "../validators/userValidator";
import { validate } from "../middleware/inputValidation";
import * as userController from "../controllers/userController";
import * as followController from "../controllers/followController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

// update user profile
router.put("/updateUserProfile", isAuthenticated, upload.single("profilePic"), userValidator.updateUserProfileValidation, validate, userController.updateUserProfile);

// delete user account
router.delete("/delete", isAuthenticated, userController.deleteUser);

// get user by search parameter
router.get("/getUsers", isAuthenticated, userController.searchUsers);


// User Follow related Routes

// Get follow state
router.get("/followState", isAuthenticated, followController.getFollowState);

// Follow a user
router.post("/follow", isAuthenticated, followController.followUser);

// Unfollow a user
router.post("/unfollow", isAuthenticated, followController.unfollowUser);

// Accept follow request
router.post("/accept", isAuthenticated, followController.acceptFollowRequest);

// Reject follow request
router.post("/reject", isAuthenticated, followController.rejectFollowRequest);

// Reject follow request
router.post("/cancel", isAuthenticated, followController.cancelFollowRequest);

// get list of users of follow request
router.get("/followRequests", isAuthenticated, followController.getFollowRequestsList);

// get list of users of followers
router.get("/getFollowers", isAuthenticated, followController.getFollowersList);

// get list of users of following
router.get("/getFollowing", isAuthenticated, followController.getFollowingList);

export default router;