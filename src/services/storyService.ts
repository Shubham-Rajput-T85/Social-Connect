import mongoose from "mongoose";
import Story from "../models/story";
import { AppError } from "../utils/errorUtils";
import { getMediaTypeFromUrl } from "../utils/mediaUtils";
import User from "../models/user";

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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { storyCount: 1 } },
      { new: true, session }
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

// Fetch stories of user
export const getStoriesFeed = async (userId: string, isCurrentUser: boolean) => {
  const now = new Date();
  let query = Story.find({
    userId,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  // Only populate views if the current user is viewing their own stories
  if (isCurrentUser) {
    query = query.populate("views", "username profileUrl name");
  }

  const stories = await query.exec();

  return stories;
};

// View a story (track viewer)
export const viewStory = async (storyId: string, viewerId: string) => {
  const story = await Story.findById(storyId);
  if (!story) throw new AppError("Story not found", 404);
  
  // Prevent duplicate views and if creator views
  if ( 
    // story.userId.toString() !== viewerId && 
  !story.views.includes(viewerId as any)) {
    story.views.push(viewerId as any);
    story.viewsCount += 1;
    await story.save();
  }
  return story;
};

// Delete a story
export const deleteStory = async (storyId: string, currentUserId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
  const story = await Story.findById(storyId);
  if (!story) throw new AppError("Story not found", 404);

  if (story.userId.toString() !== currentUserId)
    throw new AppError("Not authorized to delete story", 403);

  await Story.findByIdAndDelete(storyId);

  const updatedUser = await User.findById(currentUserId).session(session);

  if (!updatedUser) {
      throw new AppError("User not found to update post count", 404);
  }

  // Decrement user's postCount
  updatedUser.storyCount = Math.max(0, (updatedUser.storyCount || 0) - 1);
  await updatedUser.save({ session });

  return { message: "Story deleted successfully" };
  }
  catch (error) {
    // Rollback if anything fails
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
