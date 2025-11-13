"use client";

import { useState, useEffect } from "react";
import { LeaderboardEntry } from "@/lib/types/ranking";

interface UseRankingResult {
  ranking: LeaderboardEntry | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook do pobierania rankingu użytkownika
 */
export function useRanking(userId?: string): UseRankingResult {
  const [ranking, setRanking] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ranking/user/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setRanking(null);
          return;
        }
        throw new Error("Failed to fetch ranking");
      }

      const data = await response.json();
      setRanking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setRanking(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [userId]);

  return {
    ranking,
    isLoading,
    error,
    refetch: fetchRanking,
  };
}
