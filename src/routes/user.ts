import { Router } from "express";
import { upload } from "../middleware/upload";
import * as userValidator from "../validators/userValidator";
import { validate } from "../middleware/inputValidation";
import * as userController from "../controllers/userController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();


router.put("/updateUserProfile", isAuthenticated, upload.single("profilePic"), userValidator.updateUserProfileValidation, validate, userController.updateUserProfile);

router.delete("/delete", isAuthenticated, userController.deleteUser);

router.get("/getUsers", isAuthenticated, userController.searchUsersController);

export default router;