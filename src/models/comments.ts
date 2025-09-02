import mongoose from "mongoose";
import IComments from "../interfaces/IComments";

const Schema = mongoose.Schema;

const commentsSchema = new Schema<IComments>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    commentText: {
        type: String,
        required: true
    }
}, {timestamps: true});

const Comments = mongoose.model<IComments>('Comments',commentsSchema);
export default Comments;