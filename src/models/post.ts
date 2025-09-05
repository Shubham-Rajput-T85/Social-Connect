import mongoose from "mongoose";
import IPost from "../interfaces/IPost";

const Schema = mongoose.Schema;

const postSchema = new Schema<IPost>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postContent: {
        type: String,
        required: true,
    },
    media: {
        url: { type: String },
        type: { type: String, enum: ["image", "video"] },
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    commentsCount: {
        type: Number,
        default: 0,
    }
}, {timestamps: true});

postSchema.pre("save", function (next) {
    if (this.media?.url && !this.media?.type) {
      return next(new Error("Media type is required when media URL is provided"));
    }
    next();
  });

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;