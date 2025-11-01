import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  book: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  deletedBy: mongoose.Types.ObjectId[]; // uzytkownicy ktorzy usuneli czat
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// indeks dla szybkiego wyszukiwania
ConversationSchema.index({ participants: 1, book: 1 });

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
