"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TierBadge } from "@/components/ranking/tier-badge";
import { RankTrend } from "@/components/ranking/rank-trend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { LeaderboardEntry } from "@/lib/types/ranking";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileHeaderProps {
  userId: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  isOwnProfile?: boolean;
}

export function ProfileHeader({
  userId,
  username,
  email,
  profileImage,
  bio,
  location,
  isOwnProfile = false,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [ranking, setRanking] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch(`/api/ranking/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRanking(data);
        }
      } catch (error) {
        console.error("Error fetching user ranking:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, [userId]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Avatar & Basic Info */}
          <div className="flex gap-4">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={profileImage} alt={username} />
              <AvatarFallback className="text-2xl">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{username}</h1>
                {ranking && (
                  <TierBadge tier={ranking.tier} size="md" showLabel />
                )}
              </div>

              {email && (
                <p className="text-sm text-muted-foreground mt-1">{email}</p>
              )}

              {location && (
                <p className="text-sm text-muted-foreground">{location}</p>
              )}

              {bio && <p className="text-sm mt-2 max-w-2xl">{bio}</p>}
            </div>
          </div>

          {/* Ranking Info */}
          {isLoading ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Skeleton className="h-20 w-full" />
            </div>
          ) : ranking ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Global Rank
                    </span>
                    <RankTrend
                      currentRank={ranking.rank}
                      previousRank={ranking.previousRank}
                    />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">#{ranking.rank}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Score</span>
                    <span className="font-semibold tabular-nums">
                      {ranking.totalScore.toLocaleString()} pts
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/leaderboard")}
              >
                <Trophy className="mr-2 h-4 w-4" />
                View Leaderboard
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
