import { ErrorRequestHandler, RequestHandler } from "express";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

require("dotenv").config();
const app = express();
const PORT = parseInt(process.env.PORT ?? "3000");
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.blbzir6.mongodb.net/${process.env.DEFAULT_DB}?retryWrites=true&w=majority&appName=Cluster0`;

app.use(bodyParser.json());

app.use("/",(async (req, res, next) => {
    res.send(`<h1>hello server </h1>`);
}) as RequestHandler)

app.use(((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message || "";
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
}) as ErrorRequestHandler);


mongoose.connect(MONGO_URI)
    .then(async (result) => {
        app.listen(PORT, () => {
            console.log("server running at http://localhost:8080");
        })     
    })
    .catch(err => console.log(err));