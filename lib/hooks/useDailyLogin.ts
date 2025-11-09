import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAchievements } from "@/lib/hooks/useAchievements";
import { toast } from "sonner";

export function useDailyLogin() {
  const { data: session } = useSession();
  const [loginRecorded, setLoginRecorded] = useState(false);
  const { checkAchievements } = useAchievements();

  useEffect(() => {
    if (session && !loginRecorded) {
      // localStorage czy juz sie logowal dzisiaj
      const lastLogin = localStorage.getItem("lastDailyLogin");
      const today = new Date().toDateString();

      if (lastLogin !== today) {
        // zapisanie codziennego logowania
        fetch("/api/user/daily-login", {
          method: "POST",
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.alreadyLogged) {
              localStorage.setItem("lastDailyLogin", today);
              setLoginRecorded(true);

              checkAchievements("login");

              toast(`🔥 Streak updated!`, {
                position: "top-center",
                description: `+${data.pointsEarned} points! Current streak: ${data.streak} days`,
              });
            }
          })
          .catch(console.error);
      }
    }
  }, [session, loginRecorded, checkAchievements]);

  return loginRecorded;
}
