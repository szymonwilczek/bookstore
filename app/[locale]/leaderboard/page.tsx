import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LeaderboardClient } from "./leaderboard-client";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ranking" });

  return {
    title: t("leaderboard.title"),
    description: t("leaderboard.description"),
  };
}

export default async function LeaderboardPage({ params }: PageProps) {
  await params;
  return <LeaderboardClient />;
}
