import UserAchievement from "@/lib/models/UserAchievement";
import Achievement from "@/lib/models/Achievement";
import PendingAchievement from "@/lib/models/PendingAchievement";
import connectToDB from "@/lib/db/connect";

/**
 * Przyznaje osiągnięcie użytkownikowi
 * Dodaje do UserAchievement + PendingAchievement (do pokazania toast przy następnym logowaniu)
 */
export async function grantAchievement(
  userId: string,
  achievementStringId: string,
): Promise<boolean> {
  try {
    await connectToDB();

    const achievement = await Achievement.findOne({ id: achievementStringId });

    if (!achievement) {
      console.error(
        `❌ Achievement ${achievementStringId} not found in database`,
      );
      return false;
    }

    const achievementId = achievement._id.toString();

    const existingAchievement = await UserAchievement.findOne({
      userId,
      achievementId,
    });

    if (existingAchievement) {
      console.log(
        `ℹ️ User ${userId} already has achievement ${achievementStringId}`,
      );
      return false;
    }

    await UserAchievement.create({
      userId,
      achievementId,
      unlockedAt: new Date(),
    });

    await PendingAchievement.create({
      userId,
      achievementId: achievementStringId,
    }).catch((err) => {
      // ignorowanie duplikatow
      if (err.code !== 11000) throw err;
    });

    console.log(
      `✅ Achievement ${achievementStringId} granted to user ${userId} (pending toast)`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error granting achievement:", error);
    return false;
  }
}

