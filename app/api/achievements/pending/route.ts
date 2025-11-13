import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import connectToDB from "@/lib/db/connect";
import User, { IUser } from "@/lib/models/User";
import PendingAchievement from "@/lib/models/PendingAchievement";
import Achievement from "@/lib/models/Achievement";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ achievements: [] });
    }

    await connectToDB();
    const user = (await User.findOne({
      email: session.user.email,
    }).lean()) as IUser | null;

    if (!user) {
      return NextResponse.json({ achievements: [] });
    }

    // pending achievements dla usera
    const pending = await PendingAchievement.find({ userId: user._id }).lean();

    if (pending.length === 0) {
      return NextResponse.json({ achievements: [] });
    }

    // pelne dane osiagniec
    const achievementIds = pending.map((p) => p.achievementId);
    const achievements = await Achievement.find({
      id: { $in: achievementIds },
    }).lean();

    const result = achievements.map((a) => ({
      id: a.id,
      nameKey: a.nameKey.replace("achievements.", ""),
      descriptionKey: a.descriptionKey.replace("achievements.", ""),
      icon: a.icon,
      points: a.points,
      tier: a.tier,
    }));

    return NextResponse.json({ achievements: result });
  } catch (error) {
    console.error("Error fetching pending achievements:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const user = (await User.findOne({
      email: session.user.email,
    }).lean()) as IUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await PendingAchievement.deleteMany({ userId: user._id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing pending achievements:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
