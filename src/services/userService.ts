import mongoose from "mongoose";
import { userDetailDTO } from "../dtos/user/userDetailDTO";
import User from "../models/user"
import { AppError } from "../utils/errorUtils";
import Post from "../models/post";
import Comments from "../models/comments";
import Like from "../models/like";
import Conversation from "../models/conversation";
import Notification from "../models/notification";

export const findUserById = async (userId: string) => {
  const user = await User.findOne({ _id: userId }).select("_id name username bio profileUrl email isPrivate postCount followersCount followingCount");
  return user;
}

export const updateUserDetails = async (userDetail: userDetailDTO) => {
  const query = { _id: userDetail.id };

  const updateFields: Record<string, any> = {
    name: userDetail.name,
    username: userDetail.username,
  };

  if (userDetail.bio !== "" && userDetail.bio !== null && userDetail.bio !== undefined) {
    updateFields.bio = userDetail.bio;
  }

  if (userDetail.profileUrl !== "" && userDetail.profileUrl !== null && userDetail.profileUrl !== undefined) {
    updateFields.profileUrl = userDetail.profileUrl;
  }
  console.log(updateFields);
  console.log(userDetail.id);
  console.log("userdetaisl:", userDetail);

  const update = {
    $set: updateFields
  };
  const result = await User.updateOne(query, update);
  console.log(result);
  if (!result) {
    return { success: false, message: "failed to update user details" };
  }
  return { success: true, user: await findUserById(userDetail.id) };
}

export const searchUsers = async (searchQuery: string, currentUserId: string) => {
  if (!currentUserId) {
    throw new Error("Invalid current user ID");
  }

  const trimmedQuery = searchQuery.trim();

  if (!trimmedQuery) {
    return [];
  }

  const users = await User.find({
    _id: { $ne: currentUserId }, // exclude the current user
    $or: [
      { username: { $regex: `^${trimmedQuery}`, $options: "i" } },
      { name: { $regex: `^${trimmedQuery}`, $options: "i" } },
      { email: { $regex: `^${trimmedQuery}`, $options: "i" } },
    ],
  })
    .select("_id name username bio email profileUrl postCount followersCount followingCount followRequestCount isPrivate")
  // .limit(20);

  return users;
};

export const getSuggestedFriends = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const suggestedUsers = await User.aggregate([
    // Step 1: Match current user
    { $match: { _id: userObjectId } },

    // Step 2: Get the users that this user is following
    {
      $project: {
        following: 1
      }
    },

    // Step 3: Lookup followers of each followed user
    {
      $lookup: {
        from: "users", // collection name
        localField: "following",
        foreignField: "_id",
        as: "followingUsers"
      }
    },

    // Step 4: Unwind the array of followed users
    { $unwind: "$followingUsers" },

    // Step 5: Unwind the followers of each followed user
    { $unwind: "$followingUsers.followers" },

    // Step 6: Filter out users already followed by current user and self
    {
      $match: {
        $expr: {
          $and: [
            { $ne: ["$followingUsers.followers", userObjectId] }, // not self
            { $not: { $in: ["$followingUsers.followers", "$following"] } } // not already followed
          ]
        }
      }
    },

    // Step 7: Group unique suggested users
    {
      $group: {
        _id: "$followingUsers.followers"
      }
    },

    // Step 8: Lookup full user info
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },

    // Step 9: Project only required fields
    {
      $project: {
        _id: "$user._id",
        name: "$user.name",
        username: "$user.username",
        bio: "$user.bio",
        profileUrl: "$user.profileUrl",
        followersCount: "$user.followersCount",
        followingCount: "$user.followingCount",
        isPrivate: "$user.isPrivate"
      }
    },

    // Step 10: Limit results
    // { $limit: 20 }
  ]);

  return suggestedUsers;
};

export const togglePrivateState = async (userId: string) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    [
      {
        $set: {
          isPrivate: { $not: "$isPrivate" }
        }
      }
    ],
    { new: true }
  ).select("_id isPrivate");

  return updatedUser;
}

export const deleteUser = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new AppError("User not found", 404);

    // 1️⃣ Remove this user from all other users’ follow/following/request lists
    await Promise.all([
      User.updateMany(
        { following: user._id },
        { $pull: { following: user._id }, $inc: { followingCount: -1 } },
        { session }
      ),
      User.updateMany(
        { followers: user._id },
        { $pull: { followers: user._id }, $inc: { followersCount: -1 } },
        { session }
      ),
      User.updateMany(
        { followRequest: user._id },
        { $pull: { followRequest: user._id }, $inc: { followRequestCount: -1 } },
        { session }
      )
    ]);

    // 2️⃣ Delete all posts created by this user
    const userPosts = await Post.find({ userId }).session(session);
    const postIds = userPosts.map(p => p._id);

    await Post.deleteMany({ userId }).session(session);

    // 3️⃣ Delete likes by or on user's posts
    await Like.deleteMany({
      $or: [{ userId }, { postId: { $in: postIds } }],
    }).session(session);

    // 4️⃣ Delete comments by or on user's posts
    await Comments.deleteMany({
      $or: [{ userId }, { postId: { $in: postIds } }],
    }).session(session);

    // 5️⃣ Delete notifications created by or sent to this user
    await Notification.deleteMany({
      $or: [{ userId }, { senderUserId: userId }],
    }).session(session);

    // 6️⃣ Remove user from all conversations
    await Conversation.updateMany(
      { participants: user._id },
      { $pull: { participants: user._id } },
      { session }
    );

    // Optionally remove empty conversations
    await Conversation.deleteMany({ participants: { $size: 0 } }).session(session);

    // 7️⃣ Finally delete user account
    await User.deleteOne({ _id: userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: "User account deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error deleting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
};