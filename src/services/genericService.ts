import mongoose, { Model } from "mongoose";

interface FetchOwnerOptions {
  collectionName: string;     // e.g., "Post", "Comment"
  resourceId: string;         // e.g., postId, commentId
  ownerField?: string;        // e.g., "userId", "owner", "createdBy"
}

export const fetchOwnerId = async ({
  collectionName,
  resourceId,
  ownerField = "userId",       // default to userId
}: FetchOwnerOptions): Promise<string | null> => {
  if (!collectionName || !resourceId) return null;

  try {
    // Dynamically get the model
    const Model = mongoose.model(collectionName) as Model<any>;

    // Find only owner field for performance
    const doc: any = await Model.findById(resourceId).select(ownerField).lean();

    return doc ? doc[ownerField] as any || null : null;
  } catch (err) {
    console.error(`Error fetching ownerId for ${collectionName}:`, err);
    return null;
  }
};
