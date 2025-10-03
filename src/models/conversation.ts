import mongoose, { Schema } from "mongoose";
import { ConversationType, IConversation } from "../interfaces/IConversation";

const conversationSchema = new Schema<IConversation>(
    {
      participants: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      type: {
        type: String,
        enum: Object.values(ConversationType),
        default: ConversationType.DIRECT,
      },
    },
    { timestamps: true }
  );
  
  const Conversation = mongoose.model<IConversation>(
    "Conversation",
    conversationSchema
  );
  
  export default Conversation;