import { RequestHandler } from "express";
import * as commentsService from "../services/commentsService";
import { AddCommentDTO } from "../dtos/comments/addCommentDTO";
import * as genericService from "../services/genericService";
import { EditCommentDTO } from "../dtos/comments/EditCommentDTO";
import { notificationDTO } from "../dtos/notificationDTO";
import { triggerNotification } from "../services/notificationService";

export const getComments: RequestHandler = async (req: any, res, next) => {
    try {
        const postId = req.params.postId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!postId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const { comments, pagination } = await commentsService.getComments(postId, page, limit);
        console.log(comments, pagination);

        return res.status(200).json({
            success: true,
            commentList: comments,
            pagination,
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
        const postId = req.params.postId;
        const currentUserId = req.user.userId;

        if (!commentId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // check for authorized user 
        const commentOwnerUser: any = await genericService.fetchOwnerId({ collectionName: "Comments", resourceId: commentId });
        console.log("commentOwneruser:", commentOwnerUser?.toString());

        const postOwnerUser: any = await genericService.fetchOwnerId({ collectionName: "Post", resourceId: postId });
        console.log("postOwneruser:", postOwnerUser?.toString());

        if (currentUserId !== commentOwnerUser?.toString() && currentUserId !== postOwnerUser?.toString()) {
            return res.status(403).json({ message: "current user Not Authoirzed to delete comment" });
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

        const postOwnerUserId: any = await genericService.fetchOwnerId({ collectionName: "Post", resourceId: postId });
        console.log("postOwneruser:", postOwnerUserId?.toString());

        const commentsData: AddCommentDTO = {
            userId,
            commentText,
            postId
        }
        console.log("data:", commentsData);

        const response = await commentsService.addComments(commentsData);
        console.log(response);

        if(response && postOwnerUserId.toString() !== userId){
            const notificationData: notificationDTO = {
                type: "comment",
                userId: postOwnerUserId,
                senderUserId: userId
              } 
              await triggerNotification(notificationData);            
        }

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

export const editComment: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;
        const postId: any = req.params.postId;
        const commentId: any = req.params.commentId;
        const { commentText } = req.body;

        if (!postId || !commentId || !commentText) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // check for authorized user 
        const commentOwnerUser: any = await genericService.fetchOwnerId({ collectionName: "Comments", resourceId: commentId });
        console.log("commentOwneruser:", commentOwnerUser?.toString());

        if (userId !== commentOwnerUser?.toString()) {
            return res.status(403).json({ message: "current user Not Authoirzed to delete comment" });
        }
        //

        const commentsData: EditCommentDTO = {
            userId,
            commentText,
            postId,
            commentId,
        }
        
        const updatedComment = await commentsService.editComment(commentsData);

        return res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};