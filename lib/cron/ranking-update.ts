import connectToDB from "../db/connect";
import { updateAllUsers, recalculateRankings, applyDecaySystem, resetWeeklyCounters } from "../ranking/updater";

interface UpdateResult {
  success: boolean;
  usersUpdated: number;
  usersDecayed: number;
  timestamp: Date;
  error?: string;
}

/**
 * Główna funkcja daily ranking update
 * Wywoływana codziennie o 00:00 UTC przez Vercel Cron
 */
export async function dailyRankingUpdate(): Promise<UpdateResult> {
  try {
    await connectToDB();

    console.log("[Ranking Update] Starting daily ranking update...");

    // krok 1: oblicz scores dla wszystkich uzytkownikow
    console.log("[Ranking Update] Step 1: Calculating user scores...");
    const usersUpdated = await updateAllUsers();
    console.log(`[Ranking Update] Updated ${usersUpdated} users`);

    // krok 2: zastosuj decay dla nieaktywnych (>30 dni)
    console.log("[Ranking Update] Step 2: Applying decay system...");
    const usersDecayed = await applyDecaySystem();
    console.log(`[Ranking Update] Applied decay to ${usersDecayed} users`);

    // krok 3: przelicz rankingi (sort by totalScore)
    console.log("[Ranking Update] Step 3: Recalculating rankings...");
    await recalculateRankings();
    console.log("[Ranking Update] Rankings recalculated");

    // krok 4: reset weekly counters (jesli poniedzialek)
    const now = new Date();
    if (now.getDay() === 1) {
      console.log("[Ranking Update] Step 4: Resetting weekly counters (Monday)...");
      await resetWeeklyCounters();
      console.log("[Ranking Update] Weekly counters reset");
    }

    console.log("[Ranking Update] Daily update completed successfully");

    return {
      success: true,
      usersUpdated,
      usersDecayed,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Ranking Update] Error during daily update:", error);
    return {
      success: false,
      usersUpdated: 0,
      usersDecayed: 0,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
