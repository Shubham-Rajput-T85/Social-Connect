import { Types } from "mongoose";

export interface AddCommentDTO {
    userId: Types.ObjectId;
    commentText: string;
    postId: Types.ObjectId;
}
