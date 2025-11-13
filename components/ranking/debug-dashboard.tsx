"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, Users } from "lucide-react";

interface RankingScores {
  trading: number;
  reputation: number;
  community: number;
  activity: number;
  quality: number;
}

interface SingleUpdateResult {
  success: boolean;
  message: string;
  userId: string;
  ranking: {
    totalScore: number;
    tier: string;
    rank: number;
    scores: RankingScores;
  };
  timestamp: string;
}

interface BulkUpdateResult {
  success: boolean;
  message: string;
  usersUpdated: number;
  timestamp: string;
}

type UpdateResult = SingleUpdateResult | BulkUpdateResult;

export function RankingDebugDashboard() {
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateSingle = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }
    if (!secret) {
      setError("Please enter CRON_SECRET");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/ranking/test-update?userId=${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update");
      }

      setResult(data as SingleUpdateResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAll = async () => {
    if (!secret) {
      setError("Please enter CRON_SECRET");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ranking/test-update?mode=all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update");
      }

      setResult(data as BulkUpdateResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const isSingleUpdate = (result: UpdateResult): result is SingleUpdateResult => {
    return "ranking" in result;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Ranking System Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CRON_SECRET Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">CRON_SECRET</label>
          <Input
            type="password"
            placeholder="Enter your CRON_SECRET from .env.local"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Required for authorization.
          </p>
        </div>

        {/* Single User Update */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Update Single User</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={handleUpdateSingle}
              disabled={isLoading || !userId || !secret}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </div>

        {/* Update All Users */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Update All Users (Simulate Daily Cron)
          </label>
          <Button
            onClick={handleUpdateAll}
            disabled={isLoading || !secret}
            className="w-full"
            variant="secondary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Update All Rankings
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">✅ {result.message}</p>
                {"usersUpdated" in result && (
                  <p>Users Updated: {result.usersUpdated}</p>
                )}
                {isSingleUpdate(result) && (
                  <div className="mt-2 rounded bg-muted p-3 text-sm">
                    <p>Total Score: {result.ranking.totalScore}</p>
                    <p>Tier: {result.ranking.tier}</p>
                    <p>Rank: #{result.ranking.rank}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Trading: {result.ranking.scores.trading} | Reputation:{" "}
                      {result.ranking.scores.reputation} | Community:{" "}
                      {result.ranking.scores.community} | Activity:{" "}
                      {result.ranking.scores.activity} | Quality:{" "}
                      {result.ranking.scores.quality}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
