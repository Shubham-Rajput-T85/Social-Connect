import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import multer from "multer";
import path from "path";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";

dotenv.config();


const app = express();
const PORT = parseInt(process.env.PORT ?? "8080");
const PORT = parseInt(process.env.PORT ?? "8080");
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.blbzir6.mongodb.net/${process.env.DEFAULT_DB}?retryWrites=true&w=majority&appName=Cluster0`;

// ----------------------------
// Middlewares
// ----------------------------
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:3000", // Frontend URL
  credentials: true,
}));
  origin: "http://localhost:3000", // Frontend URL
  credentials: true,
}));

// ----------------------------
// Serve Uploaded Images
// ----------------------------
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

// ----------------------------
// Error Handler
// ----------------------------
// ----------------------------
// Routes
// ----------------------------
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/user", userRoutes);

// ----------------------------
// Error Handler
// ----------------------------
app.use(errorHandler);

// ----------------------------
// Start Server
// ----------------------------
// ----------------------------
// Start Server
// ----------------------------
mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));

  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));
