import Like from "../models/like";
import Post from "../models/post";

export const likePost = async (userId: string, postId: string) => {
    if (await Like.exists({ userId, postId })) {
        return null;
    }
    const newLike = await Like.create({ userId, postId });
    await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
    return await newLike.populate("userId", "_id name username bio profileUrl");
};

export const undoLikePost = async (userId: string, postId: string) => {
    // Delete the like record
    const result = await Like.deleteOne({ userId, postId });

    if (result.deletedCount > 0) {
        // Decrement like count only if a like was deleted
        await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
    }

    return result;
};

export const getUsersWhoLikePost = async (postId: string) => {
    return Like.find({ postId }).populate("userId", "_id name username bio profileUrl");   
}

export const didCurrentUserLikePost = async (userId: string, postId: string) => {
    return (await Like.exists({ userId, postId }));
}