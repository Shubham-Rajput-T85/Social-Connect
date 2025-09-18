import { RequestHandler } from "express";
import * as likeFeatureService from "../services/likeFeatureService";

export const likePost: RequestHandler = async(req, res, next) => {
    try{
        const userId = (req as any).user.userId;
        console.log("userId:",userId);
        const postId = req.params.postId;
        const data = await likeFeatureService.likePost(userId, postId as string);
        console.log(data);
        res.status(200).json({ success: true, data });
    }
    catch(err){
        next(err);
    }
}

export const undoLikePost: RequestHandler = async(req, res, next) => {
    try{
        const userId = (req as any).user.userId;
        const postId = req.params.postId;
        await likeFeatureService.undoLikePost(userId, postId as string);
        res.status(200).json({ success: true });
    }
    catch(err){
        next(err);
    }
}

export const getUsersWhoLikePost: RequestHandler = async(req, res, next) => {
    try{
        const postId = req.params.postId;
        const data = await likeFeatureService.getUsersWhoLikePost(postId as string);
        console.log(data);
        res.status(200).json({ success: true, data });
    }
    catch(err){
        next(err);
    }
}

export const didCurrentUserLikePost: RequestHandler = async(req, res, next) => {
    try{
        const userId = (req as any).user.userId;
        const postId = req.params.postId;
        const isLiked = await likeFeatureService.didCurrentUserLikePost(userId, postId as string);
        console.log(isLiked);
        res.status(200).json({ success: true, isLiked });
    }
    catch(err){
        next(err);
    }
}