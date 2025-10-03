import { Router } from "express";
import * as authController from "../controllers/authController";
import { validate } from "../middleware/inputValidation";
import { loginValidation, signupValidation } from "../validators/authValidator";
import { upload } from "../middleware/upload";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

router.post('/signup', upload.single("profilePic"), signupValidation, validate, authController.signup);

router.post('/login', loginValidation, validate, authController.login);

router.post('/logout', isAuthenticated, authController.logout);

router.get('/me', authController.getMe);

export default router;
