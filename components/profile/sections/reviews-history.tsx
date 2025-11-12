"use client";

import { useTranslations, useLocale } from "next-intl";
import { Star, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl, enUS } from "date-fns/locale";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  reviewer: {
    name?: string;
    email: string;
    username?: string;
  };
  createdAt: string;
}

interface ReviewsHistoryProps {
  reviews: Review[];
  loading: boolean;
}

export function ReviewsHistory({ reviews, loading }: ReviewsHistoryProps) {
  const t = useTranslations("profile");
  const locale = useLocale();

  const dateLocale = locale === "pl" ? pl : enUS;

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("loading")}...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{t("noReviews")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium">
                {review.reviewer.username ||
                  review.reviewer.name ||
                  review.reviewer.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: dateLocale,
                })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{review.rating}</span>
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground mt-2">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
