import { Document, Types } from "mongoose";

export type NotificationType = "like" | "comment" | "followRequest" | "acceptedRequest";

export default interface INotification extends Document {
  type: NotificationType;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  senderUserId: Types.ObjectId,
  createdAt: Date;
  updatedAt: Date;
}