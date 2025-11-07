import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import connectToDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import LoginStreak from "@/lib/models/LoginStreak";
import PointsHistory from "@/lib/models/PointsHistory";

const DAILY_LOGIN_POINTS = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // znajdz lub utworz nowy streak logowania
    let streak = await LoginStreak.findOne({ user: user._id });
    if (!streak) {
      streak = await LoginStreak.create({
        user: user._id,
        currentStreak: 0,
        longestStreak: 0,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = streak.lastLoginDate
      ? new Date(streak.lastLoginDate)
      : null;
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }

    // czy user juz sie dzis zalogowal
    if (lastLogin && lastLogin.getTime() === today.getTime()) {
      return NextResponse.json({
        message: "Already logged in today",
        streak: streak.currentStreak,
        pointsEarned: 0,
        alreadyLogged: true,
      });
    }

    // sprawdzenie czy to juz kolejny dzien
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let streakContinued = false;
    if (lastLogin && lastLogin.getTime() === yesterday.getTime()) {
      // kontynuacja streaku
      streak.currentStreak += 1;
      streakContinued = true;
    } else {
      // nowy streak
      streak.currentStreak = 1;
    }

    // aktualizacja najdluzszego streaku
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastLoginDate = new Date();
    await streak.save();

    // dodanie puntkow
    user.points += DAILY_LOGIN_POINTS;
    await user.save();

    // zapisanie historii
    await PointsHistory.create({
      user: user._id,
      amount: DAILY_LOGIN_POINTS,
      type: "earned",
      source: "daily_login",
      description: `Daily login bonus (${streak.currentStreak} day streak)`,
    });

    return NextResponse.json({
      message: "Daily login recorded",
      streak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      pointsEarned: DAILY_LOGIN_POINTS,
      streakContinued,
    });
  } catch (error) {
    console.error("Error recording daily login:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
