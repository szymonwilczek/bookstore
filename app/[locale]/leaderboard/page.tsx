import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LeaderboardClient } from "./leaderboard-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "ranking" });

  return {
    title: t("leaderboard.title"),
    description: t("leaderboard.description"),
  };
}

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
