"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function WishlistForm() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => setWishlist(data.wishlist || []));
    }
  }, [session]);

  const searchBooks = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}&maxResults=10`
      );
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
    setLoading(false);
  };

  const addToWishlist = async (book) => {
    await fetch("/api/user/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.[0] || "Unknown",
        isbn: book.volumeInfo.industryIdentifiers?.[0]?.identifier,
        imageUrl: book.volumeInfo.imageLinks?.thumbnail,
        genres: book.volumeInfo.categories || [],
      }),
    });
    // refetch po dodaniu
    const res = await fetch("/api/user/profile");
    const data = await res.json();
    setWishlist(data.wishlist || []);
  };

  const removeFromWishlist = async (bookId) => {
    await fetch("/api/user/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    // refetch po usunieciu
    const res = await fetch("/api/user/profile");
    const data = await res.json();
    setWishlist(data.wishlist || []);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl mb-2">Dodaj do Wishlisty</h2>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Szukaj książki"
      />
      <Button onClick={searchBooks} disabled={loading} className="ml-2">
        {loading ? "Szukam..." : "Szukaj"}
      </Button>
      <div className="mt-4">
        <h3>Wyniki wyszukiwania:</h3>
        {searchResults.map((book) => (
          <motion.div
            key={book.id}
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="border p-2 mb-2"
          >
            <p>
              {book.volumeInfo?.title} -{" "}
              {book.volumeInfo?.authors?.join(", ") || "Brak autora"}
            </p>
            <Button onClick={() => addToWishlist(book)}>
              Dodaj do Wishlisty
            </Button>
          </motion.div>
        ))}
      </div>
      <div className="mt-4">
        <h3>Twoja Wishlista:</h3>
        {wishlist.map((book) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border p-2 mb-2"
          >
            <p>
              {book.title} - {book.author}
            </p>
            <Button
              onClick={() => removeFromWishlist(book._id)}
              variant="destructive"
            >
              Usuń
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
