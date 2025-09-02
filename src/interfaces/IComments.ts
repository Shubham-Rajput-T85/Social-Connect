import { Document, Types } from "mongoose";

export default interface IComments extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;
}
