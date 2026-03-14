"use client";

/**
 * Leaderboard: period toggle (weekly/monthly), list of rankings with rank, displayName, scorePercentage.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Ranking {
  rank: number;
  userId: string;
  displayName: string;
  scorePercentage: number;
}

interface LeaderboardViewProps {
  journeyId: string;
  period: "weekly" | "monthly";
  periodStart: string;
  periodLabel: string;
  rankings: Ranking[];
}

export function LeaderboardView({
  journeyId,
  period,
  periodStart,
  periodLabel,
  rankings,
}: LeaderboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setPeriod(newPeriod: "weekly" | "monthly") {
    const p = new URLSearchParams(searchParams.toString());
    p.set("period", newPeriod);
    p.delete("periodStart");
    startTransition(() => {
      router.push(`/journeys/${journeyId}/leaderboard?${p.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">{periodLabel}</p>
        <div className="flex rounded border border-border-default bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            disabled={isPending}
            className={`rounded px-3 py-1.5 text-sm font-medium min-h-[44px] ${
              period === "weekly"
                ? "bg-crimsonSubtle text-brand-crimsonDeep border border-border-crimson"
                : "text-secondary hover:text-primary"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            disabled={isPending}
            className={`rounded px-3 py-1.5 text-sm font-medium min-h-[44px] ${
              period === "monthly"
                ? "bg-crimsonSubtle text-brand-crimsonDeep border border-border-crimson"
                : "text-secondary hover:text-primary"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {rankings.length === 0 ? (
        <p className="text-secondary">No entries for this period yet.</p>
      ) : (
        <ul className="space-y-2">
          {rankings.map((r) => (
            <li
              key={r.userId}
              className="flex items-center justify-between rounded-lg border border-border-default bg-surface p-3"
            >
              <span className="font-medium text-tertiary w-8">#{r.rank}</span>
              <span className="flex-1 text-primary">{r.displayName}</span>
              <span className="text-brand-crimson font-medium">
                {r.scorePercentage.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
