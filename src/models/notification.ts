import mongoose from "mongoose";
import INotification from "../interfaces/INotification";

const Schema = mongoose.Schema;

const notificationSchema = new Schema<INotification>({
    type: {
        type: String,
        enum: ["like", "comment", "followRequest", "acceptedRequest"],
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: false
    },
    senderUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true        
    }
}, {timestamps: true});

const Notifications = mongoose.model<INotification>('Notification',notificationSchema);
export default Notifications;