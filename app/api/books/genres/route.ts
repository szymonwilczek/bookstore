import { NextResponse } from "next/server";
import connectToDB from "@/lib/db/connect";
import Book from "@/lib/models/Book";

export async function GET() {
  try {
    await connectToDB();

    const books = await Book.find({ status: "available" }, "genres");

    const genresSet = new Set<string>();
    books.forEach((book) => {
      book.genres.forEach((genre: string) => {
        if (genre) genresSet.add(genre);
      });
    });

    const genres = Array.from(genresSet).sort();

    return NextResponse.json({ genres });
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json({ genres: [] });
  }
}
