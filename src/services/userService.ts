import mongoose, { Types } from "mongoose";
import { userDetailDTO } from "../dtos/user/userDetailDTO";
import User from "../models/user"

export const findUserById = async (userId: string) => {
    const user = await User.findOne({ _id: userId }).select("_id name username bio profileUrl email");
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

export const deleteUser = async (userId: string) => {
    const result = await User.deleteOne({ _id: userId });
    console.log(result);
    if (!result) {
        return { success: false, message: "failed to update user details" };
    }
    return { success: true };
}

export const searchUsers = async (searchQuery: string, currentUserId: string) => {
  // Trim query for better UX
  const trimmedQuery = searchQuery.trim();

  if (!trimmedQuery) {
    return [];
  }

  // Validate currentUserId
  if (!currentUserId) {
    throw new Error("Invalid current user ID");
  }

  // Search only users whose username, name, or email starts with the searchQuery
  const users = await User.find({
    _id: { $ne: currentUserId }, // exclude the current user
    $or: [
      { username: { $regex: `^${trimmedQuery}`, $options: "i" } },
      { name: { $regex: `^${trimmedQuery}`, $options: "i" } },
      { email: { $regex: `^${trimmedQuery}`, $options: "i" } },
    ],
  })
    .select("_id name username email profileUrl postCount followersCount followingCount followRequestCount") // only return required fields
    .limit(20); // limit results for performance

  return users;
};

interface FollowActionResult {
  success: boolean;
  message?: string;
  currentState?: "Follow" | "Requested" | "Following" | "Follow Back";
}

/**
 * Get the follow state between current user and target user
 */
export const getFollowState = async (
  currentUserId: string,
  targetUserId: string
): Promise<"Follow" | "Requested" | "Following" | "Follow Back"> => {
  const targetUser = await User.findById(targetUserId)
    .select("followers followRequest following")
    .lean();

  if (!targetUser) throw new Error("Target user not found");

  const currentFollowsTarget = targetUser.followers.some(
    (id: Types.ObjectId) => id.toString() === currentUserId
  );

  const currentRequestedTarget = targetUser.followRequest.some(
    (id: Types.ObjectId) => id.toString() === currentUserId
  );

  const targetFollowsCurrent = targetUser.following.some(
    (id: Types.ObjectId) => id.toString() === currentUserId
  );

  if (currentFollowsTarget) return "Following";
  if (currentRequestedTarget) return "Requested";
  if (targetFollowsCurrent) return "Follow Back";
  return "Follow";
};

/**
 * Follow user with transaction
 */
export const followUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<FollowActionResult> => {
  if (currentUserId === targetUserId) {
    return { success: false, message: "Cannot follow yourself" };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetUser = await User.findById(targetUserId)
      .select("followers followRequest following isPrivate followersCount followRequestCount")
      .session(session);

    if (!targetUser) throw new Error("Target user not found");

    const currentUser = await User.findById(currentUserId)
      .select("following followingCount")
      .session(session);

    if (!currentUser) throw new Error("Current user not found");

    const currentIdObj = new Types.ObjectId(currentUserId);
    const targetIdObj = new Types.ObjectId(targetUserId);

    if (targetUser.followers.includes(currentIdObj)) {
      return { success: false, message: "Already following", currentState: "Following" };
    }

    if (targetUser.followRequest.includes(currentIdObj)) {
      return { success: false, message: "Request already sent", currentState: "Requested" };
    }

    if (targetUser.isPrivate) {
      // Private account → add to followRequest
      targetUser.followRequest.push(currentIdObj);
      targetUser.followRequestCount = targetUser.followRequest.length;
      await targetUser.save({ session });

      await session.commitTransaction();
      session.endSession();
      return { success: true, currentState: "Requested" };
    } else {
      // Public account → follow directly
      targetUser.followers.push(currentIdObj);
      targetUser.followersCount = targetUser.followers.length;

      currentUser.following.push(targetIdObj);
      currentUser.followingCount = currentUser.following.length;

      await Promise.all([targetUser.save({ session }), currentUser.save({ session })]);

      await session.commitTransaction();
      session.endSession();
      return { success: true, currentState: "Following" };
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return { success: false, message: "Failed to follow user" };
  }
};

/**
 * Accept follow request with transaction
 */
export const acceptFollowRequest = async (
  targetUserId: string,
  requesterUserId: string
): Promise<FollowActionResult> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetUser = await User.findById(targetUserId)
      .select("followRequest followers followersCount")
      .session(session);
    const requester = await User.findById(requesterUserId)
      .select("following followingCount")
      .session(session);

    if (!targetUser || !requester) throw new Error("User not found");

    const requesterIdObj = new Types.ObjectId(requesterUserId);
    const targetIdObj = new Types.ObjectId(targetUserId);

    if (!targetUser.followRequest.includes(requesterIdObj)) {
      return { success: false, message: "No follow request from this user" };
    }

    // Remove from followRequest and add to followers
    targetUser.followRequest = targetUser.followRequest.filter(id => !id.equals(requesterIdObj));
    targetUser.followRequestCount = targetUser.followRequest.length;
    targetUser.followers.push(requesterIdObj);
    targetUser.followersCount = targetUser.followers.length;

    requester.following.push(targetIdObj);
    requester.followingCount = requester.following.length;

    await Promise.all([targetUser.save({ session }), requester.save({ session })]);

    await session.commitTransaction();
    session.endSession();

    return { success: true, currentState: "Following" };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return { success: false, message: "Failed to accept follow request" };
  }
};

/**
 * Unfollow user with transaction
 */
export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<FollowActionResult> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetUser = await User.findById(targetUserId).select("followers followersCount").session(session);
    const currentUser = await User.findById(currentUserId).select("following followingCount").session(session);

    if (!targetUser || !currentUser) throw new Error("User not found");

    const currentIdObj = new Types.ObjectId(currentUserId);
    const targetIdObj = new Types.ObjectId(targetUserId);

    targetUser.followers = targetUser.followers.filter(id => !id.equals(currentIdObj));
    targetUser.followersCount = targetUser.followers.length;

    currentUser.following = currentUser.following.filter(id => !id.equals(targetIdObj));
    currentUser.followingCount = currentUser.following.length;

    await Promise.all([targetUser.save({ session }), currentUser.save({ session })]);

    await session.commitTransaction();
    session.endSession();

    return { success: true, currentState: "Follow" };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return { success: false, message: "Failed to unfollow user" };
  }
};

/**
 * Reject follow request with transaction
 */
export const rejectFollowRequest = async (
  targetUserId: string,
  requesterUserId: string
): Promise<FollowActionResult> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetUser = await User.findById(targetUserId)
      .select("followRequest followRequestCount")
      .session(session);

    if (!targetUser) throw new Error("Target user not found");

    const requesterIdObj = new Types.ObjectId(requesterUserId);
    targetUser.followRequest = targetUser.followRequest.filter(id => !id.equals(requesterIdObj));
    targetUser.followRequestCount = targetUser.followRequest.length;

    await targetUser.save({ session });
    await session.commitTransaction();
    session.endSession();

    return { success: true, currentState: "Follow" };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return { success: false, message: "Failed to reject follow request" };
  }
};
