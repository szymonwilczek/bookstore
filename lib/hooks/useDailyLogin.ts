import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAchievements } from "@/lib/hooks/useAchievements";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PendingAchievement {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  points: number;
  tier: string;
}

export function useDailyLogin() {
  const { data: session } = useSession();
  const [loginRecorded, setLoginRecorded] = useState(false);
  const [achievementsChecked, setAchievementsChecked] = useState(false);
  const { checkAchievements } = useAchievements();
  const t = useTranslations("achievements");

  useEffect(() => {
    const handleDailyLogin = async () => {
      if (!session || loginRecorded) return;

      const lastLogin = localStorage.getItem("lastDailyLogin");
      const today = new Date().toDateString();

      if (lastLogin === today) return;

      // 1. codzienny login
      try {
        const res = await fetch("/api/user/daily-login", {
          method: "POST",
        });
        const data = await res.json();

        if (!data.alreadyLogged) {
          localStorage.setItem("lastDailyLogin", today);
          setLoginRecorded(true);

          checkAchievements("login");

          toast(`🔥 ${t("streakUpdated")}`, {
            position: "top-center",
            description: `+${data.pointsEarned} ${t("pointsGained")}! ${t("currentStreak")}: ${data.streak} ${t("days")}`,
          });
        }
      } catch (error) {
        console.error("Error recording daily login:", error);
      }
    };

    const handlePendingAchievements = async () => {
      if (!session || achievementsChecked) return;

      setAchievementsChecked(true);

      try {
        const res = await fetch("/api/achievements/pending");
        const data = await res.json();

        if (data.achievements && data.achievements.length > 0) {
          data.achievements.forEach((achievement: PendingAchievement) => {
            toast.success(`🎉 ${t("unlocked")}`, {
              position: "top-center",
              description: `${achievement.icon} ${t(achievement.nameKey.replace("achievements.", ""))} (+${achievement.points} ${t("pointsGained")})`,
              duration: 6000,
            });
          });

          await fetch("/api/achievements/pending", {
            method: "DELETE",
          });
        }
      } catch (error) {
        console.error("Error checking pending achievements:", error);
      }
    };

    handleDailyLogin();
    handlePendingAchievements();
  }, [session, loginRecorded, achievementsChecked, checkAchievements, t]);

  return loginRecorded;
}
