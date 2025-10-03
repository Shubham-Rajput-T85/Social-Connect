import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errorUtils";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("inside error handler middleware", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      data: err.data || null,
    });
  }
  else if (err instanceof Error) {
    return res.status((err as any).statusCode || 500).json({
      message: err.message || "Internal Server Error",
      data: (err as any).data || null,
    });
  }

  // Fallback for unexpected errors
  res.status(500).json({
    message: "Internal Server Error",
  });
};
