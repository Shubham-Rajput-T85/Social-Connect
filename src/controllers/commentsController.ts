import { RequestHandler } from "express";
import * as commentsService from "../services/commentsService";
import { addCommentsDTO } from "../dtos/comments/addCommentsDTO";
import * as genericService from "../services/genericService";

export const getComments: RequestHandler = async (req: any, res, next) => {
    try {
        const postId = req.params.postId;

        if (!postId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const response = await commentsService.getComments(postId);
        console.log(response);

        return res.status(200).json({
            ...response
        });
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}

export const deleteComment: RequestHandler = async (req: any, res, next) => {
    try {
        const commentId = req.params.commentId;
        const currentUserId = req.user.userId;

        if (!commentId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // check for authorized user 
        const postOwnerUser: any = await genericService.fetchOwnerId({collectionName: "Comment", resourceId: commentId});
        console.log("postOwneruser:",postOwnerUser?.toString());
        
        if (currentUserId !== postOwnerUser?.toString()) {
            return res.status(400).json({ message: "Not Authoirzed to delete comment" });
        }
        //

        const response = await commentsService.deleteComments(commentId);

        console.log(response);

        return res.status(200).json({
            success: true
        });
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}

export const addComment: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;
        const postId:any = req.params.postId;
        const { commentText } = req.body;

        if (!postId || !commentText) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const commentsData: addCommentsDTO = {
            userId,
            commentText,
            postId
        }

        const response = await commentsService.addComments(commentsData);
        console.log(response);

        return res.status(201).json({
            message: "Comment added successfully"
        });
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}