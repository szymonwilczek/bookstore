"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaderboardResponse } from "@/lib/types/ranking";

interface UseLeaderboardResult {
  data: LeaderboardResponse | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

interface UseLeaderboardOptions {
  initialPage?: number;
  limit?: number;
}

/**
 * Hook do pobierania leaderboard z pagination
 */
export function useLeaderboard(
  options: UseLeaderboardOptions = {},
): UseLeaderboardResult {
  const { initialPage = 1, limit = 100 } = options;

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/ranking/leaderboard?page=${currentPage}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    data,
    isLoading,
    error,
    currentPage,
    setPage,
    refetch: fetchLeaderboard,
  };
}
