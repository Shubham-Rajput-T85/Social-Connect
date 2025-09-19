import { RequestHandler } from "express";
import { addPostDTO } from "../dtos/post/addPostDTO";
import * as postService from "../services/postService";
import * as genericService from "../services/genericService";

export const getMyPostFeed: RequestHandler = async (req: any, res, next) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const response = await postService.getPostsByUser(userId);
        console.log(response);

        return res.status(200).json({
            postList: response
        });
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}

export const getPostByUser: RequestHandler = async (req: any, res, next) => {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const isPrivate = await genericService.fetchOwnerId({collectionName: "User", resourceId: userId, ownerField: "isPrivate"});
        console.log("isPrivate:",isPrivate);
        const userFollowingList: any = await genericService.fetchOwnerId({collectionName: "User", resourceId: userId, ownerField: "following"});
        console.log("following list:",userFollowingList);
        const isUserAuthorized = userFollowingList?.some((ids: any) => ids.toString() === currentUserId) ?? false;

        if (isPrivate && !isUserAuthorized) {
            return res.status(400).json({ message: "Not Authoirzed to see post" });
        }

        const response = await postService.getPostsByUser(userId);

        return res.status(200).json({
            postList: response
        });
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}

export const getHomeFeedPost: RequestHandler = async (req: any, res, next) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const { posts, pagination } = await postService.getPostsOfUserAndFollowingUser(
            userId,
            page,
            limit
        );

        return res.status(200).json({
            success: true,
            postList: posts,
            pagination,
        });
    } catch (err) {
        console.error("Error fetching home feed posts:", err);
        next(err);
    }
};

export const deletePost: RequestHandler = async (req: any, res, next) => {
    try {
        const { postId }: any = req.query;
        const currentUserId = req.user.userId;
        if (!postId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const postOwnerUser = await genericService.fetchOwnerId({collectionName: "Post", resourceId: postId});
        console.log("postOwneruser:",postOwnerUser?.toString());
        
        if (currentUserId !== postOwnerUser?.toString()) {
            return res.status(400).json({ message: "Not Authoirzed to delete post" });
        }

        const response = await postService.deletePost(postId);

        return res.status(204).json({
            success: true
        });
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}

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