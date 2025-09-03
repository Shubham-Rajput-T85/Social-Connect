import { Router } from "express";
import * as authController from "../controllers/authController";
import isAuthenticated from "../middleware/isAuthenticated";


const router = Router();

router.post('/signup',isAuthenticated , authController.signup);

router.post('/login', authController.login);

router.get('/me', authController.getMe);

export default router;
