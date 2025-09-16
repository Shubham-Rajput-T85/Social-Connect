import { RequestHandler } from "express";
import * as authService from "../services/authService";
import { loginDTO } from "../dtos/auth/loginDTO";
import { signupDTO } from "../dtos/auth/signupDTO";
import { clearCookie } from "../utils/cookieUtils";

export const signup: RequestHandler = async (req, res, next) => {
  try {
    console.log("Incoming Body:", req.body);
    console.log("Incoming File:", req.file);

    const { name, email, username, password, bio } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const signupObj: signupDTO = {
      name,
      email,
      username,
      password,
      bio,
      profileUrl: req.file ? `/uploads/${req.file.filename}` : "",
    };

    const response = await authService.signup(signupObj);
    console.log(response);

    return res.status(201).json({
      user: response
    });
  }
  catch (err) {
    console.log(err);
    console.error(err);
    next(err);
  }
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const usernameOrEmail = req.body.usernameOrEmail;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe ?? false;

    const loginObj: loginDTO = {
      usernameOrEmail: usernameOrEmail,
      password: password,
      rememberMe: false
    }

    const response = await authService.login(res, loginObj);
    console.log(response);
    return res.status(200).json(response);
  }
  catch (err) {
    console.log(err);
    console.error(err);
    next(err);
  }
}

export const logout: RequestHandler = async (req, res, next) => {
  // clear http only cookie
  clearCookie(res, "jwt");

  return res.status(200).json({ success: true, message: "Logout successfully" });
}

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // read from HttpOnly cookie

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await authService.getMe(token);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
