import mongoose, { Document, Schema } from "mongoose";

export interface IPendingAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  createdAt: Date;
}

const PendingAchievementSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

PendingAchievementSchema.index(
  { userId: 1, achievementId: 1 },
  { unique: true },
);

export default mongoose.models.PendingAchievement ||
  mongoose.model<IPendingAchievement>(
    "PendingAchievement",
    PendingAchievementSchema,
  );
