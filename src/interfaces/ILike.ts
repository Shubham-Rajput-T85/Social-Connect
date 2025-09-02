import { Document, Types } from "mongoose";

export default interface ILike extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
