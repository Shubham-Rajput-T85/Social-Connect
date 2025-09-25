import mongoose from "mongoose";
import { AddCommentDTO } from "../dtos/comments/addCommentsDTO";
import { EditCommentDTO } from "../dtos/comments/EditCommentDTO";
import Comments from "../models/comments";
import { AppError } from "../utils/errorUtils";
import IPost from "../interfaces/IPost";
import Post from "../models/post";
import IComments from "../interfaces/IComments";

export const getComments = async (
    postId: string,
    page: number = 1,
    limit: number = 10
) => {
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

    const total = await Comments.countDocuments({ postId });

    const comments:IComments[] = await Comments.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username email name profileUrl bio isPrivate").lean();

    const hasMore = skip + comments.length < total;

    return {
        comments,
        pagination: {
            page,
            limit,
            total,
            hasMore
        }
    };
};

export const addComments = async (commentsData: AddCommentDTO) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newComment = await Comments.create([{ ...commentsData }],{ session });   // use array as session cannot be given in create function unless

        if (!newComment) {
            throw new AppError("Failed to create comment", 500);
        }

        const updatedPost:IPost | null = await Post.findByIdAndUpdate(
            { _id: commentsData.postId },
            { $inc: { commentsCount: 1 } },
            { session }
        );

        if (!updatedPost) {
            throw new AppError("Post not found to update comments count", 404);
        }

        const populatedComment = await newComment[0].populate("userId", "username email name profileUrl bio isPrivate");

        await session.commitTransaction();
        session.endSession();

        return {
            message: "Comment added successfully",
            comment: populatedComment,
            updatedPost
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const editComment = async (data: EditCommentDTO) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const updatedComment = await Comments.findOneAndUpdate(
        { _id: data.commentId, postId: data.postId, userId: data.userId },
        { $set: { commentText: data.commentText, updatedAt: new Date() } },
        { new: true, session }
      );
  
      if (!updatedComment) {
        throw new AppError("Comment not found or you are not authorized to edit", 404);
      }
  
      await session.commitTransaction();
      session.endSession();
  
      return updatedComment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  };

export const deleteComments = async (commentId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const comment:IComments | null = await Comments.findById(commentId).session(session);

        if (!comment) {
            throw new AppError("Post not found", 404);
        }

        await Comments.findByIdAndDelete(commentId).session(session);

        const post: IPost | null = await Post.findById(comment.postId).session(session);

        if (!post) {
            throw new AppError("User not found to update post count", 404);
        }

        post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
        await post.save({ session });

        await session.commitTransaction();
        session.endSession();

        return { message: "Comment deleted successfully", commentId };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};