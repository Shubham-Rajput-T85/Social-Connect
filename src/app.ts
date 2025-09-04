import { ErrorRequestHandler, RequestHandler } from "express";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import cors from "cors";
import cookieParser from "cookie-parser";


dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT ?? "3000");
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.blbzir6.mongodb.net/${process.env.DEFAULT_DB}?retryWrites=true&w=majority&appName=Cluster0`;

app.use(bodyParser.json());
app.use(cookieParser());


app.use(cors({
    origin: `http://localhost:3000`, // frontend url where it runs
    credentials: true
  }));

// ROUTES
app.use('/auth', authRoutes);

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