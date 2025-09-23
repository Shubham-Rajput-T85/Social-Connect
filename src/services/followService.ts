import mongoose, { Types } from "mongoose";
import User from "../models/user";

interface FollowActionResult {
  success: boolean;
  message?: string;
  currentState?: "Follow" | "Requested" | "Following" | "Follow Back";
  isPrivate?: boolean;
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
 * Follow user with transaction,
 * currentUserId - user id who is sending the request,
 * targetUserId - user id who will recieve the request
 */
export const followUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<FollowActionResult> => {
  if (currentUserId === targetUserId || !currentUserId || !targetUserId) {
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

    const followState = await getFollowState(currentUserId, targetUserId);

    if (followState === "Following") {
      return { success: false, message: "Already following", currentState: "Following" };
    }

    if (followState === "Requested") {
      return { success: false, message: "Request already sent", currentState: "Requested" };
    }

    if (targetUser.isPrivate) {
      // Private account → add to followRequest
      targetUser.followRequest.push(currentIdObj);
      targetUser.followRequestCount = targetUser.followRequest.length;
      await targetUser.save({ session });

      await session.commitTransaction();
      session.endSession();
      return { success: true, currentState: "Requested", isPrivate: true };
    } else {
      // Public account → follow directly
      targetUser.followers.push(currentIdObj);
      targetUser.followersCount = targetUser.followers.length;

      currentUser.following.push(targetIdObj);
      currentUser.followingCount = currentUser.following.length;

      await Promise.all([targetUser.save({ session }), currentUser.save({ session })]);

      await session.commitTransaction();
      session.endSession();
      return { success: true, currentState: "Following", isPrivate: false };
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return { success: false, message: "Failed to follow user" };
  }
};

/**
 * Accept follow request with transaction,
 * requesterUserId: who request for accepting follow request,
 * targetUserId: current user of UI who will accept or reject that request
 */
export const acceptFollowRequest = async (
  requesterUserId: string,
  targetUserId: string
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

    const followState = await getFollowState(requesterUserId, targetUserId);

    if (followState !== "Requested") {
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

    const followState = await getFollowState(currentUserId, targetUserId);

    if (followState !== "Following") {
      return { success: false, message: "You cannot unfollow user whom you not following", currentState: "Following" };
    }

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
 * requesterUserId: who request for accepting follow request,
 * targetUserId: current user of UI who will accept or reject that request
 */
export const rejectFollowRequest = async (
  requesterUserId: string,
  targetUserId: string
): Promise<FollowActionResult> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetUser = await User.findById(targetUserId)
      .select("followRequest followRequestCount")
      .session(session);

    if (!targetUser) throw new Error("Target user not found");

    const followState = await getFollowState(requesterUserId, targetUserId);

    if (followState !== "Requested") {
      return { success: false, message: "No follow request from this user" };
    }

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

/**
 * Gives followRequest list for given id
 */
export const getFollowRequestsList = async (userId: string) => {
  return await User.findById(userId)
    .populate("followRequest", "_id username email name profileUrl isPrivate")
    .select("followRequest followRequestCount");
};

/**
 * Gives followers list for given id
 */
export const getFollowersList = async (userId: string) => {
  return await User.findById(userId)
    .populate("followers", "_id username email name profileUrl isPrivate")
    .select("followers followersCount");
};

/**
 * Gives following list for given id
 */
export const getFollowingList = async (userId: string) => {
  return await User.findById(userId)
    .populate("following", "_id username email name profileUrl isPrivate")
    .select("following followingCount");
};

