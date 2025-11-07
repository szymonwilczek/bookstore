"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, ArrowRightLeft, Coins } from "lucide-react";
import { TransactionHistory } from "./transactions-history";
import { PointsHistorySection } from "./points-history-section";
import { useTranslations } from "next-intl";

interface HistorySectionProps {
  userEmail?: string;
  isPublicView?: boolean;
}

export function HistorySection({
  userEmail,
  isPublicView,
}: HistorySectionProps) {
  const t = useTranslations("profile");

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <CardTitle>{t("history")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              {t("transactions")}
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {t("points")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            <div className="lg:max-h-[450px] lg:overflow-y-auto">
              <TransactionHistory userEmail={userEmail} />
            </div>
          </TabsContent>

          <TabsContent value="points" className="mt-4">
            <div className="lg:max-h-[450px] lg:overflow-y-auto">
              <PointsHistorySection isPublicView={isPublicView} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
