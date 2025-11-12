import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db/connect";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ email });
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
