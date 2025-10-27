import mongoose from "mongoose";
import Story from "../models/story";
import { AppError } from "../utils/errorUtils";
import { getMediaTypeFromUrl } from "../utils/mediaUtils";
import User from "../models/user";

// Add Story
export const addStory = async (userId: string, caption: string, mediaUrl: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const mediaType = getMediaTypeFromUrl(mediaUrl);
    if (!mediaType) throw new AppError("Invalid media type", 400);

    const story = new Story({
      userId,
      caption,
      media: { url: mediaUrl, type: mediaType },
    });

    await story.save({ session });

    await User.findByIdAndUpdate(
      userId,
      { $inc: { storyCount: 1 } },
      { new: true, session }
    );

    await session.commitTransaction();
    return story;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
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

  await User.findByIdAndUpdate(userId, { storyCount: stories.length });

  return stories;
};

// View a story (track viewer)
export const viewStory = async (storyId: string, viewerId: string) => {
  const story = await Story.findById(storyId);
  if (!story) throw new AppError("Story not found", 404);
  
  // Prevent duplicate views and if creator views
  if ( 
    story.userId.toString() !== viewerId && 
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
  try {
    session.startTransaction();

    const story = await Story.findById(storyId).session(session);
    if (!story) throw new AppError("Story not found", 404);
    if (story.userId.toString() !== currentUserId)
      throw new AppError("Not authorized to delete story", 403);

    await Story.deleteOne({ _id: storyId }).session(session);

    await User.findByIdAndUpdate(
      currentUserId,
      { $inc: { storyCount: -1 } },
      { session }
    );

    await session.commitTransaction();
    return { message: "Story deleted successfully" };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
