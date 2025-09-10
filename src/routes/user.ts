import { Router } from "express";
import { createUpload } from "../middleware/upload";
import * as userValidator from "../validators/userValidator";
import { validate } from "../middleware/inputValidation";
import * as userController from "../controllers/userController";

const router = Router();

// Dynamic upload for (profile pics)
const profilePicUpload = createUpload((req) => {
    const username = req.body.username?.trim();
    return username ? `${username}_profile` : "";
  });

router.put("/updateUserProfile", profilePicUpload.single("profilePic"), userValidator.updateUserProfileValidation, validate, userController.updateUserProfile);

router.put("/deleteUser", userController.deleteUser);

export default router;