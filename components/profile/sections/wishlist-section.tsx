"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { BookCard } from "../book-card";

interface BookBase {
  id: string;
  title: string;
  author?: string;
  image?: string;
  createdAt: string;
}

interface WishlistSectionProps {
  wishlistBooks: BookBase[];
  onDeleteWishlistBook: (bookId: string) => void;
}

export function WishlistSection({
  wishlistBooks,
  onDeleteWishlistBook,
}: WishlistSectionProps) {
  const needsCarousel = wishlistBooks.length > 4;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wishlist</CardTitle>
        <CardDescription>Books you want to receive</CardDescription>
      </CardHeader>
      <CardContent>
        {needsCarousel ? (
          <Carousel
            className="w-full"
            opts={{ loop: false }}
            plugins={[Autoplay({ delay: 7500 })]}
          >
            <CarouselContent>
              {wishlistBooks.map((book) => (
                <CarouselItem
                  key={book.id}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <BookCard
                    book={book}
                    isReadOnly={false}
                    onDelete={onDeleteWishlistBook}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        ) : (
          <div className="flex gap-4">
            {wishlistBooks.map((book) => (
              <div key={book.id} className="flex-1">
                <BookCard
                  book={book}
                  isReadOnly={false}
                  onDelete={onDeleteWishlistBook}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
