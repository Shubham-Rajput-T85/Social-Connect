import mongoose, { Schema } from "mongoose";
import { IStory } from "../interfaces/IStory";

const storySchema = new Schema<IStory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
    },
    caption: {
      type: String,
      default: "",
    },
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // expires after 24hrs of creation
      // default: () => new Date(Date.now() + 20 * 1000), // expires after min of creation
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// // Auto-delete expired stories using TTL index
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model<IStory>("Story", storySchema);
export default Story;
