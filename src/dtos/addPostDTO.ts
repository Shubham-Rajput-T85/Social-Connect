import { Types } from "mongoose";

export interface addPostDTO {
    userId: Types.ObjectId;
    postContent: string;
    mediaUrl?: string;
}
