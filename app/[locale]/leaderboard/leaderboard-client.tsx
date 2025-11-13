"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LeaderboardTable } from "@/components/ranking/leaderboard-table";
import { UserSearchModal } from "@/components/ranking/user-search-modal";
import { CompareModal } from "@/components/ranking/compare-modal";
import { TierBadge } from "@/components/ranking/tier-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users } from "lucide-react";
import { LeaderboardEntry, LeaderboardResponse } from "@/lib/types/ranking";

export function LeaderboardClient() {
  const { data: session } = useSession();
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardResponse | null>(null);
  const [currentUserRanking, setCurrentUserRanking] =
    useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareUserId, setCompareUserId] = useState<string>("");

  useEffect(() => {
    fetchLeaderboard(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchCurrentUserRanking();
    }
  }, [session?.user?.email]);

  const fetchLeaderboard = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/ranking/leaderboard?page=${page}&limit=100`,
      );
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUserRanking = async () => {
    try {
      const userResponse = await fetch("/api/user/current");
      if (!userResponse.ok) return;

      const userData = await userResponse.json();
      const userId = userData.user._id;

      const rankingResponse = await fetch(`/api/ranking/user/${userId}`);
      if (rankingResponse.ok) {
        const ranking = await rankingResponse.json();
        setCurrentUserRanking(ranking);
      }
    } catch (error) {
      console.error("Error fetching current user ranking:", error);
    }
  };

  const handleUserSelect = (userId: string) => {
    if (currentUserRanking) {
      setCompareUserId(userId);
      setCompareModalOpen(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top users ranked by their activity and contributions
          </p>
        </div>
        <Button onClick={() => setSearchModalOpen(true)}>
          <Search className="mr-2 h-4 w-4" />
          Search Users
        </Button>
      </div>

      {/* Current User Position Card */}
      {currentUserRanking && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-3xl font-bold">#{currentUserRanking.rank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tier</p>
                <TierBadge
                  tier={currentUserRanking.tier}
                  size="lg"
                  showLabel
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {currentUserRanking.totalScore.toLocaleString()} pts
                </p>
              </div>
              <div className="flex-1" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchModalOpen(true)}
                >
                  Compare with Others
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 100 Users</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable
            users={leaderboardData?.users || []}
            currentUserId={currentUserRanking?.userId}
            totalPages={leaderboardData?.totalPages || 1}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <UserSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onUserSelect={handleUserSelect}
      />

      {currentUserRanking && compareUserId && (
        <CompareModal
          open={compareModalOpen}
          onOpenChange={setCompareModalOpen}
          user1Id={currentUserRanking.userId}
          user2Id={compareUserId}
        />
      )}
    </div>
  );
}
