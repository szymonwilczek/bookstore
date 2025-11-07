import mongoose, { Document, Schema } from "mongoose";

export interface IPointsHistory extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: "earned" | "spent";
  source:
    | "transaction_sent"
    | "transaction_received"
    | "review"
    | "achievement"
    | "daily_login"
    | "book_promotion"
    | "promotion_refund";
  description: string;
  relatedBook?: mongoose.Types.ObjectId;
  relatedTransaction?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PointsHistorySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["earned", "spent"], required: true },
    source: {
      type: String,
      enum: [
        "transaction_sent",
        "transaction_received",
        "review",
        "achievement",
        "daily_login",
        "book_promotion",
        "promotion_refund",
      ],
      required: true,
    },
    description: { type: String, required: true },
    relatedBook: { type: Schema.Types.ObjectId, ref: "Book" },
    relatedTransaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { timestamps: true }
);

PointsHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.PointsHistory ||
  mongoose.model<IPointsHistory>("PointsHistory", PointsHistorySchema);
