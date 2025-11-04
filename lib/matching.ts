import connectToDB from "./db/connect";
import User from "./models/User";

interface OfferedBook {
  _id: string;
  title: string;
  author: string;
  imageUrl?: string;
  isActive?: boolean;
  status: string;
}

export async function getMatchingOffers(userEmail: string) {
  await connectToDB();
  const user = await User.findOne({ email: userEmail }).populate("wishlist");
  if (!user) return [];

  const userWishlistTitles = user.wishlist.map((book: { title: string }) =>
    book.title.toLowerCase()
  );

  // szukanie uzytkownikow ktorych oferowane ksiazki pasuja do wishlisty
  const matchingUsers = await User.find({
    _id: { $ne: user._id },
    offeredBooks: { $exists: true, $ne: [] },
  }).populate("offeredBooks");

  const matches = [];
  for (const otherUser of matchingUsers) {
    for (const offeredBook of otherUser.offeredBooks as OfferedBook[]) {
      const isBookActive = offeredBook.isActive !== false;
      const isBookAvailable = offeredBook.status === "available";

      if (
        isBookActive &&
        isBookAvailable &&
        userWishlistTitles.includes(offeredBook.title.toLowerCase())
      ) {
        matches.push({
          offeredBook,
          owner: otherUser,
          matchType: "wishlist",
        });
      }
    }
  }

  return matches.slice(0, 10);
}
