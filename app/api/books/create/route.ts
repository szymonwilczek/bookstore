import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import Book from "@/lib/models/Book";
import User from "@/lib/models/User";
import connect from "@/lib/db/connect";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const book = new Book({
      title: body.title,
      author: body.author,
      description: body.description,
      imageUrl: body.image,
      owner: user._id,
      status: "available",
      genres: body.genres || [],
    });

    const savedBook = await book.save();

    return NextResponse.json({
      id: savedBook._id.toString(),
      ...savedBook.toObject(),
    });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
