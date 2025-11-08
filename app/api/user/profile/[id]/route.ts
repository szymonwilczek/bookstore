import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import connectToDB from "@/lib/db/connect";
import User, { IUser } from "@/lib/models/User";
import Book, { IBook } from "@/lib/models/Book";
import Review from "@/lib/models/Review";
import Transaction from "@/lib/models/Transaction";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  await connectToDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const user = (await User.findById(id)
    .select("-password -googleId")
    .lean()) as IUser;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isOwnProfile = session?.user?.email === user.email;

  // ustawienia prywatnosci
  const publicProfile = {
    _id: user._id,
    username: user.username,
    email: user.settings?.hideEmail && !isOwnProfile ? null : user.email,
    location: user.location,
    bio: user.bio,
    profileImage: user.profileImage,
    github: user.github,
    twitter: user.twitter,
    website: user.website,
    points: user.points,
    averageRating: user.averageRating,
    createdAt: user.createdAt,
  };

  // offered books tylko available
  const offeredBooks = await Book.find({
    _id: { $in: user.offeredBooks },
    status: "available",
    isActive: { $ne: false },
  }).lean();

  // wishlist jesli publiczna
  let wishlist: IBook[] = [];
  if (isOwnProfile || !user.settings?.hideWishlist) {
    wishlist = (await Book.find({
      _id: { $in: user.wishlist },
    }).lean()) as IBook[];
  }

  // recenzje
  const reviews = await Review.find({ reviewedUser: user._id })
    .populate("reviewer", "username profileImage")
    .populate("transactionId", "createdAt")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // statystyki
  const completedTransactions = await Transaction.countDocuments({
    $or: [{ initiator: user._id }, { receiver: user._id }],
    status: "completed",
  });

  const stats = {
    completedTransactions,
    offeredBooksCount: offeredBooks.length,
    wishlistCount: wishlist.length,
    reviewsCount: reviews.length,
    joinedDaysAgo: Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ),
  };

  return NextResponse.json({
    user: publicProfile,
    offeredBooks,
    wishlist: user.settings?.hideWishlist && !isOwnProfile ? [] : wishlist,
    reviews,
    stats,
    isOwnProfile,
  });
}
