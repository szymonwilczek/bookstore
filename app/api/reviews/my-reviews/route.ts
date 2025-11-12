import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import connectToDB from "@/lib/db/connect";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 401 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reviews = await Review.find({ reviewedUser: user._id })
      .sort({ createdAt: -1 })
      .populate("reviewer", "name email username")
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
