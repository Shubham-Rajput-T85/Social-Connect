import mongoose from "mongoose";

export enum ConversationType {
  DIRECT = "direct",
  GROUP = "group",
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: ConversationType;
  createdAt: Date;
  updatedAt: Date;
}