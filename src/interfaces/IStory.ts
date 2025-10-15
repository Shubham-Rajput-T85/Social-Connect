import mongoose from "mongoose";
import { IMedia } from "../constants/common";

export interface IStory extends mongoose.Document {
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId;
    media?: IMedia;
    caption?: string;
    views: mongoose.Types.ObjectId[];
    viewsCount: number;
    expiresAt: Date;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
  }