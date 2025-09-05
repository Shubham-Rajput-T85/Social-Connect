import { Router } from "express";
import * as authController from "../controllers/authController";
// import { upload } from "../middleware/upload";
import { validate } from "../middleware/inputValidation";
import { loginValidation, signupValidation } from "../validators/authValidator";
import { createUpload } from "../middleware/upload";

const router = Router();

// Dynamic upload for signup (profile pics)
const profilePicUpload = createUpload((req) => {
    const username = req.body.username?.trim();
    return username ? `${username}_profile` : "";
  });

// router.post('/signup', signupValidation, validate, upload.single("profilePic"), authController.signup);

router.post('/signup', profilePicUpload.single("profilePic"), signupValidation, validate, authController.signup);

router.post('/login', loginValidation, validate, authController.login);

router.get('/me', authController.getMe);

export default router;
