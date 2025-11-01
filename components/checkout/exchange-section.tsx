"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Star, Package, Truck, User } from "lucide-react";
import { BookInventory } from "./book-inventory";
import { ExchangeZone } from "./exchange-zone";
import { OwnerInfo } from "./owner-info";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { BookDragItem } from "./book-drag-item";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ExchangeSectionProps {
  requestedBook: any;
  userBooks: any[];
  offeredBooks: any[];
  exchangeLocation: string;
  deliveryMethod: string;
  onOfferedBooksChange: (books: any[]) => void;
  onLocationChange: (location: string) => void;
  onDeliveryMethodChange: (method: string) => void;
}

export function ExchangeSection({
  requestedBook,
  userBooks,
  offeredBooks,
  exchangeLocation,
  deliveryMethod,
  onOfferedBooksChange,
  onLocationChange,
  onDeliveryMethodChange,
}: ExchangeSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (over.id === "exchange-zone") {
      const bookId = active.id as string;
      const book = userBooks.find((b) => b._id === bookId);

      if (book && !offeredBooks.find((b) => b._id === bookId)) {
        onOfferedBooksChange([...offeredBooks, book]);
      }
    } else if (over.id === "inventory") {
      const bookId = active.id as string;
      onOfferedBooksChange(offeredBooks.filter((b) => b._id !== bookId));
    }
  };

  const handleRemoveFromExchange = (bookId: string) => {
    onOfferedBooksChange(offeredBooks.filter((b) => b._id !== bookId));
  };

  const activeDragBook = activeId
    ? userBooks.find((b) => b._id === activeId) ||
      offeredBooks.find((b) => b._id === activeId)
    : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lewy panel - Twoje książki */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5" />
              <h3 className="font-semibold">Twoje książki</h3>
              <Badge variant="secondary">{userBooks.length}</Badge>
            </div>
            <BookInventory books={userBooks} offeredBooks={offeredBooks} />
          </div>

          {/* Środkowy panel - Wymiana */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-4 text-center">Wymiana</h3>
            <ExchangeZone
              requestedBook={requestedBook}
              offeredBooks={offeredBooks}
              onRemoveBook={handleRemoveFromExchange}
            />

            {/* Metoda dostawy */}
            <div className="mt-4">
              <Label>Metoda dostawy *</Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={onDeliveryMethodChange}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="personal"
                    id={`personal-${requestedBook._id}`}
                  />
                  <Label
                    htmlFor={`personal-${requestedBook._id}`}
                    className="font-normal cursor-pointer flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Odbiór osobisty
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="paczkomat"
                    id={`paczkomat-${requestedBook._id}`}
                  />
                  <Label
                    htmlFor={`paczkomat-${requestedBook._id}`}
                    className="font-normal cursor-pointer flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Paczkomat InPost
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="courier"
                    id={`courier-${requestedBook._id}`}
                  />
                  <Label
                    htmlFor={`courier-${requestedBook._id}`}
                    className="font-normal cursor-pointer flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Kurier
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Lokalizacja */}
            <div className="mt-4">
              <Label htmlFor={`location-${requestedBook._id}`}>
                {deliveryMethod === "personal"
                  ? "Miejsce odbioru *"
                  : deliveryMethod === "paczkomat"
                    ? "Numer Paczkomatu *"
                    : "Adres dostawy *"}
              </Label>
              <Input
                id={`location-${requestedBook._id}`}
                value={exchangeLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder={
                  deliveryMethod === "personal"
                    ? "np. Warszawa, Rynek Główny"
                    : deliveryMethod === "paczkomat"
                      ? "np. WAW01M"
                      : "np. ul. Marszałkowska 1, Warszawa"
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Prawy panel - Informacje o oferującym */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-4">Oferujący</h3>
            <OwnerInfo owner={requestedBook.owner} />
          </div>
        </div>
      </Card>

      <DragOverlay>
        {activeDragBook ? <BookDragItem book={activeDragBook} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
