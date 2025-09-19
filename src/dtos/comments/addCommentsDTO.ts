import { Types } from "mongoose";

export interface addCommentsDTO {
    userId: Types.ObjectId;
    commentText: string;
    postId: Types.ObjectId;
}
