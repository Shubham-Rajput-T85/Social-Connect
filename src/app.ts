import { ErrorRequestHandler, RequestHandler } from "express";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";

dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT ?? "3000");
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.blbzir6.mongodb.net/${process.env.DEFAULT_DB}?retryWrites=true&w=majority&appName=Cluster0`;

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // folder where images will be stored
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

const upload = multer({ storage });
// app.use(multer({storage: fileStorage, fileFilter: fileFilter }).single('image'));


app.use(bodyParser.json());
app.use(cookieParser());


app.use(cors({
    origin: `http://localhost:3000`, // frontend url where it runs
    credentials: true
  }));


// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ROUTES
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/user', userRoutes);

// app.use("/",(async (req, res, next) => {
//     res.send(`<h1>hello server </h1>`);
// }) as RequestHandler)

app.use(errorHandler);

mongoose.connect(MONGO_URI)
    .then(async (result) => {
        app.listen(PORT, () => {
            console.log("server running at http://localhost:8080");
        })     
    })
    .catch(err => console.log(err));