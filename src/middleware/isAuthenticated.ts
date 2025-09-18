import { Request, RequestHandler } from "express";
import { AppError } from "../utils/errorUtils";
import { verifyToken } from "../utils/jwtUtils";

const isAuthenticated: RequestHandler = (req, res, next) => {
  // Read JWT from HttpOnly cookie
  const token = req.cookies?.jwt;

  if (!token) {
    const error = new AppError("Not authenticated.");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decodedToken = verifyToken(token);

    // Attach user info to request for later use
    (req as any).user = decodedToken;

    console.log("current user",(req as any).user);

    return next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    const error = new AppError("Invalid or expired token.");
    error.statusCode = 401;
    return next(error);
  }
};

export default isAuthenticated;
