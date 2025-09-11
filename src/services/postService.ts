import mongoose from "mongoose";
import { addPostDTO } from "../dtos/post/addPostDTO";
import Post from "../models/post";
import { AppError } from "../utils/errorUtils";
import { getMediaTypeFromUrl } from "../utils/mediaUtils";
import User from "../models/user";

// export const addPost = async (postData: addPostDTO) => {
//     const { userId, postContent, mediaUrl } = postData;

//     // Determine media type if media URL is provided
//     let mediaObject = undefined;
//     if (mediaUrl) {
//         const mediaType = getMediaTypeFromUrl(mediaUrl);

//         if (!mediaType) {
//             throw new AppError("Invalid media type", 400, [
//                 { field: "media", message: "Unsupported file format for media" },
//             ]);
//         }

//         mediaObject = { url: mediaUrl, type: mediaType };
//     }
//     const newPost = new Post({
//         userId,
//         postContent,
//         media: mediaObject,
//     });
//     const response = await newPost.save();
//     console.log("response: ", response);

//     return response;
// }

/**
 * Get all posts for a specific user
 */
export const getPostsByUser = async (userId: string) => {
    const result = await Post.find({ userId }).sort({ createdAt: -1 }).populate("userId", "username email name");
    return result;
}

/**
 * Delete post by ID
 */
// export const deletePost = async (postId: string) => {
//     return await Post.findByIdAndDelete(postId);
// }

export const addPost = async (postData: addPostDTO) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, postContent, mediaUrl } = postData;

        // Determine media type if media URL is provided
        let mediaObject = undefined;
        if (mediaUrl) {
            const mediaType = getMediaTypeFromUrl(mediaUrl);

            if (!mediaType) {
                throw new AppError("Invalid media type", 400, [
                    { field: "media", message: "Unsupported file format for media" },
                ]);
            }

            mediaObject = { url: mediaUrl, type: mediaType };
        }

        // Step 1: Create new post
        const newPost = await Post.create(
            [
                {
                    userId,
                    postContent,
                    media: mediaObject,
                },
            ],
            { session } // attach session
        );

        if (!newPost || newPost.length === 0) {
            throw new AppError("Failed to create post", 500);
        }

        // Step 2: Increment user's postCount
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { postCount: 1 } },
            { new: true, session }
        );

        if (!updatedUser) {
            throw new AppError("User not found to update post count", 404);
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return newPost[0];
    } catch (error) {
        // Rollback if anything fails
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};


export const deletePost = async (postId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Find the post to get userId
        const post = await Post.findById(postId).session(session);

        if (!post) {
            throw new AppError("Post not found", 404);
        }

        const userId = post.userId;

        // Step 2: Delete the post
        await Post.findByIdAndDelete(postId).session(session);

        // Step 3: Decrement user's postCount
        // const updatedUser = await User.findByIdAndUpdate(
        //     userId,
        //     {
        //         $inc: { postCount: -1 },
        //         $max: { postCount: 0 }, // ensure it never goes negative
        //     },
        //     { new: true, session }
        // );
        const updatedUser = await User.findById(userId).session(session);
        
        if (!updatedUser) {
            throw new AppError("User not found to update post count", 404);
        }

        updatedUser.postCount = Math.max(0, (updatedUser.postCount || 0) - 1);
        await updatedUser.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return { message: "Post deleted successfully", postId };
    } catch (error) {
        // Rollback if anything fails
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
