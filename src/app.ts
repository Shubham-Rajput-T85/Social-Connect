import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.route";
import postRoutes from "./routes/post.route";
import userRoutes from "./routes/user.route";
import notificationRoutes from "./routes/notification.route";
import conversationRoutes from "./routes/conversation.route";
import messageRoutes from "./routes/message.route";
import storyRoutes from "./routes/story.route";

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
app.use("/conversation", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/story", storyRoutes);

// ----------------------------
// Error Handler
// ----------------------------
app.use(errorHandler);

export default app;