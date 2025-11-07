import mongoose, { Document, Schema } from "mongoose";

export interface ILoginStreak extends Document {
  user: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoginStreakSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.LoginStreak ||
  mongoose.model<ILoginStreak>("LoginStreak", LoginStreakSchema);
