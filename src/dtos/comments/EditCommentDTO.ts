import { Types } from "mongoose";

export interface EditCommentDTO {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    commentId: Types.ObjectId;
    commentText: string;
  }