import mongoose from "mongoose";

export enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    SEEN = "seen",
}

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    text: string;
    status: MessageStatus;
    createdAt: Date;
    deliveredTo?: mongoose.Types.ObjectId[];
    seenBy?: mongoose.Types.ObjectId[];
    updatedAt?: Date;
    editedAt?: Date;
}