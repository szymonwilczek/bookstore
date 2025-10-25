import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/auth';
import connectToDB from '@/lib/db/connect';
import Review from '@/lib/models/Review';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { transactionId, rating, comment } = await req.json();
  await connectToDB();

  const transaction = await Transaction.findById(transactionId).populate('initiator receiver');
  const reviewer = await User.findOne({ email: session.user.email });

  const reviewedUser = transaction.initiator._id.equals(reviewer._id) ? transaction.receiver : transaction.initiator;

  const review = await Review.create({
    transactionId,
    reviewer: reviewer._id,
    reviewedUser: reviewedUser._id,
    rating,
    comment,
  });

  // aktualizacja oceny
  const reviews = await Review.find({ reviewedUser: reviewedUser._id });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  reviewedUser.averageRating = avgRating;
  await reviewedUser.save();

  return NextResponse.json(review);
}
