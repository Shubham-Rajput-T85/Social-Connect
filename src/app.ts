import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";
import notificationRoutes from "./routes/notification";

dotenv.config();

const app = express();

// ----------------------------
// Middlewares
// ----------------------------
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);

// ----------------------------
// Serve Uploaded Images
// ----------------------------
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ----------------------------
// Routes
// ----------------------------
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/user", userRoutes);
app.use("/notification", notificationRoutes);

// ----------------------------
// Error Handler
// ----------------------------
app.use(errorHandler);

export default app;