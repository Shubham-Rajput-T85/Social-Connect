import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errorUtils";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      data: err.data || null,
    });
  }

  // Fallback for unexpected errors
  res.status(500).json({
    message: "Internal Server Error",
  });
};
