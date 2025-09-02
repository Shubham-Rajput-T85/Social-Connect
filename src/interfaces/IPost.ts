import { Document, Types } from "mongoose";

interface IMedia {
  url?: string;
  type?: "image" | "video";
}

export default interface IPost extends Document {
  userId: Types.ObjectId;
  postContent: string;
  media?: IMedia;
  likeCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
