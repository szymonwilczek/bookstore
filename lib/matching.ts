import connectToDB from './db/connect';
import User from './models/User';

export async function getMatchingOffers(userEmail: string) {
  await connectToDB();
  const user = await User.findOne({ email: userEmail }).populate('wishlist');
  if (!user) return [];

  const userWishlistTitles = user.wishlist.map((book: { title: string }) => book.title.toLowerCase());

  // szukanie uzytkownikow ktorych oferowane ksiazki pasuja do wishlisty
  const matchingUsers = await User.find({
    _id: { $ne: user._id }, // wykluczanie siebie 
    offeredBooks: { $exists: true, $ne: [] }
  }).populate('offeredBooks');

  const matches = [];
  for (const otherUser of matchingUsers) {
    for (const offeredBook of otherUser.offeredBooks) {
      if (userWishlistTitles.includes(offeredBook.title.toLowerCase())) {
        matches.push({
          offeredBook,
          owner: otherUser,
          matchType: 'wishlist' // jako priorytet
        });
      }
    }
  }

  // jesli malo wynikow to dodae dopasowania po autorze/gatunku (TODO: ulepszyc, jest uproszczone)
  if (matches.length < 5) {
    // TODO 
  }

  return matches.slice(0, 10); // top 10
}
