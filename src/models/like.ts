import mongoose from "mongoose";
import ILike from "../interfaces/ILike";

const Schema = mongoose.Schema;

const likeSchema = new Schema<ILike>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {timestamps: true});

const Like = mongoose.model<ILike>('Like',likeSchema);
export default Like;