import { Document, Types } from "mongoose";
import { IMedia } from "../constants/common";

export default interface IPost extends Document {
  userId: Types.ObjectId;
  postContent: string;
  media?: IMedia;
  likeCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
