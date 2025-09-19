import mongoose from "mongoose";
import { addCommentsDTO } from "../dtos/comments/addCommentsDTO";
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
    // Skip formula for pagination
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

    // Get total count for frontend
    const total = await Comments.countDocuments({ postId });

    // Fetch paginated posts
    const comments:IComments[] = await Comments.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username email name profileUrl bio").lean();

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

/**
 * Add Comments
 */
export const addComments = async (commentsData: addCommentsDTO) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Create new post
        const newComment = await Comments.create([{ ...commentsData }],{ session });   // use array as session cannot be given in create function unless

        if (!newComment) {
            throw new AppError("Failed to create comment", 500);
        }

        // Step 2: Increment user's postCount
        const updatedPost:IPost | null = await Post.findByIdAndUpdate(
            { _id: commentsData.postId },
            { $inc: { commentsCount: 1 } },
            { session }
        );

        if (!updatedPost) {
            throw new AppError("Post not found to update comments count", 404);
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return;
    } catch (error) {
        // Rollback if anything fails
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Delete Comment by Id
 */
export const deleteComments = async (commentId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the post to get userId
        const comment:IComments | null = await Comments.findById(commentId).session(session);

        if (!comment) {
            throw new AppError("Post not found", 404);
        }

        // Delete the post
        await Comments.findByIdAndDelete(commentId).session(session);

        const post: IPost | null = await Post.findById(comment.postId).session(session);

        if (!post) {
            throw new AppError("User not found to update post count", 404);
        }

        // Decrement user's postCount
        post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
        await post.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return { message: "Comment deleted successfully", commentId };
    } catch (error) {
        // Rollback if anything fails
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};