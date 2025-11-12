"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface PointsHistoryItem {
  _id: string;
  amount: number;
  type: "earned" | "spent";
  source: string;
  description: string;
  createdAt: string;
  relatedBook?: {
    title: string;
    imageUrl?: string;
  };
}

interface PointsHistorySectionProps {
  history: PointsHistoryItem[];
  loading: boolean;
  isPublicView?: boolean;
}

export function PointsHistorySection({
  history,
  loading,
  isPublicView = false,
}: PointsHistorySectionProps) {
  const t = useTranslations("profile");

  if (isPublicView) return null;

  if (loading) {
    return <p className="text-muted-foreground">{t("loading")}...</p>;
  }

  if (history.length === 0) {
    return <p className="text-muted-foreground">{t("noPointsHistory")}</p>;
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            {item.type === "earned" ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">{item.description}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div
            className={`text-lg font-bold ${
              item.type === "earned" ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.type === "earned" ? "+" : "-"}
            {item.amount}
          </div>
        </div>
      ))}
    </div>
  );
}
