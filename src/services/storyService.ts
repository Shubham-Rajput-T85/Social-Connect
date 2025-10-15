import mongoose from "mongoose";
import Story from "../models/story";
import User from "../models/user";
import { AppError } from "../utils/errorUtils";
import { getMediaTypeFromUrl } from "../utils/mediaUtils";

// Add Story
export const addStory = async (userId: string, caption: string, mediaUrl: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const mediaType = getMediaTypeFromUrl(mediaUrl);
    if (!mediaType) throw new AppError("Invalid media type", 400);

    const story = await Story.create(
      [
        {
          userId,
          caption,
          media: { url: mediaUrl, type: mediaType },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return story[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Fetch stories of user + following
export const getStoriesFeed = async (userId: string) => {
  const user = await User.findById(userId).select("following");
  if (!user) throw new AppError("User not found", 404);

  const usersToFetch = [...(user.following || [])];

  const now = new Date();
  const stories = await Story.find({
    userId: { $in: usersToFetch },
    expiresAt: { $gt: now }
  })
    .populate("userId", "username profileUrl name")
    .sort({ createdAt: -1 });

  return stories;
};

// View a story (track viewer)
export const viewStory = async (storyId: string, viewerId: string) => {
  const story = await Story.findById(storyId);
  if (!story) throw new AppError("Story not found", 404);

  // Prevent duplicate views
  if (!story.views.includes(viewerId as any)) {
    story.views.push(viewerId as any);
    story.viewsCount += 1;
    await story.save();
  }
  return story;
};

// Delete a story
export const deleteStory = async (storyId: string, currentUserId: string) => {
  const story = await Story.findById(storyId);
  if (!story) throw new AppError("Story not found", 404);

  if (story.userId.toString() !== currentUserId)
    throw new AppError("Not authorized to delete story", 403);

  await Story.findByIdAndDelete(storyId);
  return { message: "Story deleted successfully" };
};
