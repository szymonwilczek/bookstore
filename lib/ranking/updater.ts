import connectToDB from "../db/connect";
import UserRanking from "../models/UserRanking";
import User, { IUser } from "../models/User";
import { calculateUserScore, assignTier } from "./calculator";
import { subDays } from "date-fns";

/**
 * Aktualizuje ranking dla pojedynczego użytkownika
 */
export async function updateSingleUser(userId: string): Promise<void> {
  await connectToDB();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // oblicz scores
  const { totalScore, scores, stats } = await calculateUserScore(userId);

  // przypisz tier
  const tier = assignTier(totalScore);

  // znajdz lub utworz ranking
  let ranking = await UserRanking.findOne({ userId });

  if (!ranking) {
    ranking = await UserRanking.create({
      userId,
      totalScore,
      scores,
      tier,
      rank: 0,
      previousRank: 0,
      stats,
      weeklyExchanges: 0,
      weeklyReviews: 0,
      lastActivity: new Date(),
      lastCalculated: new Date(),
    });
  } else {
    ranking.totalScore = totalScore;
    ranking.scores = scores;
    ranking.tier = tier;
    ranking.stats = stats;
    ranking.lastCalculated = new Date();

    await ranking.save();
  }
}

/**
 * Aktualizuje rankingi dla wszystkich użytkowników
 */
export async function updateAllUsers(): Promise<number> {
  await connectToDB();

  const users = (await User.find({}).lean()) as IUser[];
  let updated = 0;

  for (const user of users) {
    try {
      await updateSingleUser(user._id.toString());
      updated++;
    } catch (error) {
      console.error(`Failed to update user ${user._id}:`, error);
    }
  }

  return updated;
}

/**
 * Przelicza rankingi - sortuje użytkowników po totalScore i przypisuje pozycje
 */
export async function recalculateRankings(): Promise<void> {
  await connectToDB();

  const rankings = await UserRanking.find({}).sort({ totalScore: -1 }).lean();

  for (let i = 0; i < rankings.length; i++) {
    const currentRanking = rankings[i];
    const newRank = i + 1;

    await UserRanking.findByIdAndUpdate(currentRanking._id, {
      previousRank: currentRanking.rank,
      rank: newRank,
    });
  }
}

/**
 * Stosuje decay system - użytkownicy nieaktywni >30 dni tracą 5% punktów
 */
export async function applyDecaySystem(): Promise<number> {
  await connectToDB();

  const thirtyDaysAgo = subDays(new Date(), 30);

  const inactiveRankings = await UserRanking.find({
    lastActivity: { $lt: thirtyDaysAgo },
    totalScore: { $gt: 0 },
  });

  let decayed = 0;

  for (const ranking of inactiveRankings) {
    const newTotalScore = Math.round(ranking.totalScore * 0.95);
    const newScores = {
      trading: Math.round(ranking.scores.trading * 0.95),
      reputation: Math.round(ranking.scores.reputation * 0.95),
      community: Math.round(ranking.scores.community * 0.95),
      activity: Math.round(ranking.scores.activity * 0.95),
      quality: Math.round(ranking.scores.quality * 0.95),
    };

    const newTier = assignTier(newTotalScore);

    ranking.totalScore = newTotalScore;
    ranking.scores = newScores;
    ranking.tier = newTier;

    await ranking.save();
    decayed++;
  }

  return decayed;
}

/**
 * Resetuje liczniki tygodniowe (wywołane w poniedziałki)
 */
export async function resetWeeklyCounters(): Promise<void> {
  await connectToDB();

  await UserRanking.updateMany(
    {},
    {
      weeklyExchanges: 0,
      weeklyReviews: 0,
    },
  );
}

/**
 * Aktualizuje lastActivity dla użytkownika
 */
export async function updateUserActivity(userId: string): Promise<void> {
  await connectToDB();

  await UserRanking.findOneAndUpdate(
    { userId },
    { lastActivity: new Date() },
    { upsert: true },
  );
}

/**
 * Inkrementuje licznik weekly exchanges
 */
export async function incrementWeeklyExchanges(userId: string): Promise<void> {
  await connectToDB();

  const ranking = await UserRanking.findOne({ userId });
  if (ranking) {
    ranking.weeklyExchanges += 1;
    await ranking.save();
  }
}

/**
 * Inkrementuje licznik weekly reviews
 */
export async function incrementWeeklyReviews(userId: string): Promise<void> {
  await connectToDB();

  const ranking = await UserRanking.findOne({ userId });
  if (ranking) {
    ranking.weeklyReviews += 1;
    await ranking.save();
  }
}
