import { RequestHandler } from "express";
import { addPostDTO } from "../dtos/post/addPostDTO";
import * as postService from "../services/postService";

export const addPost: RequestHandler = async (req, res, next) => {
    try {
        console.log("Incoming Body:", req.body);
        console.log("Incoming File:", req.file);
        const { userId, postContent } = req.body;

        if (!userId || !postContent) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const postData: addPostDTO = {
            userId,
            postContent,
            mediaUrl: req.file ? `/uploads/${req.file.filename}` : ""
        }

        const response = await postService.addPost(postData);
        console.log(response);

        return res.status(201).json({
            post: response
        });
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}