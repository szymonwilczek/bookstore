"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface TransactionUser {
  _id: string;
  email: string;
  username?: string;
}

interface ReviewTransaction {
  _id: string;
  initiator: TransactionUser;
  receiver: TransactionUser;
}

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: ReviewTransaction;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewModal({
  open,
  onOpenChange,
  transaction,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const otherUser =
    transaction.initiator.email === transaction.receiver.email
      ? transaction.receiver
      : transaction.initiator;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Proszę wybrać ocenę");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Oceń wymianę</DialogTitle>
          <DialogDescription>
            Jak oceniasz wymianę z {otherUser.username || otherUser.email}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ocena *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Bardzo słabo"}
                {rating === 2 && "Słabo"}
                {rating === 3 && "W porządku"}
                {rating === 4 && "Dobrze"}
                {rating === 5 && "Świetnie!"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Komentarz (opcjonalnie)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Napisz kilka słów o wymianie..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? "Wysyłanie..." : "Wyślij opinię"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
