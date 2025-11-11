"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Coins } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

export function PointsDisplay() {
  const { data: session } = useSession();
  const [points, setPoints] = useState<number>(0);
  const t = useTranslations("navbar.points");

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => setPoints(data.points || 0))
        .catch(console.error);
    }
  }, [session]);

  if (!session) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-default">
            <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
              {points}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{t("title")}</p>
            <p className="text-xs text-muted-foreground">{t("earnBy")}</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• {t("dailyLogin")}</li>
              <li>• {t("writingReviews")}</li>
              <li>• {t("completingTransactions")}</li>
              <li>• {t("achievements")}</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              {t("promoteBook")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
