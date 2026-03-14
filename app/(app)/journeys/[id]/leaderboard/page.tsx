/**
 * Leaderboard: GET with period=weekly|monthly and periodStart. Period selector; rankings with score %.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import {
  getCurrentWeekPeriod,
  getCurrentMonthPeriod,
} from "@/lib/date-utils";
import { LeaderboardView } from "@/components/domain/LeaderboardView";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; periodStart?: string }>;
}

async function fetchJourneyName(
  id: string,
  cookie: string
): Promise<string | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/journeys/${id}`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.journey?.name ?? null;
}

async function fetchLeaderboard(
  journeyId: string,
  cookie: string,
  period: "weekly" | "monthly",
  periodStart: string
): Promise<{ rank: number; userId: string; displayName: string; scorePercentage: number }[]> {
  const base = await getBaseUrl();
  const res = await fetch(
    `${base}/api/journeys/${journeyId}/leaderboard?period=${period}&periodStart=${periodStart}`,
    { cache: "no-store", headers: { cookie } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.rankings ?? [];
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { period: queryPeriod, periodStart: queryPeriodStart } = await searchParams;
  const user = await getSessionUser();
  if (!user) notFound();

  const cookie = await getCookieHeader();
  const journeyName = await fetchJourneyName(id, cookie);
  if (!journeyName) notFound();

  const period =
    queryPeriod === "monthly" || queryPeriod === "weekly"
      ? queryPeriod
      : "weekly";
  const weekPeriod = getCurrentWeekPeriod(user.timezone);
  const monthPeriod = getCurrentMonthPeriod(user.timezone);
  const periodStart =
    queryPeriodStart && /^\d{4}-\d{2}-\d{2}$/.test(queryPeriodStart)
      ? queryPeriodStart
      : period === "weekly"
        ? weekPeriod.periodStart
        : monthPeriod.periodStart;

  const rankings = await fetchLeaderboard(id, cookie, period, periodStart);

  const periodLabel =
    period === "weekly"
      ? `Week of ${periodStart}`
      : `${periodStart.slice(0, 7)}`;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Link
        href={`/journeys/${id}`}
        className="text-sm text-brand-crimson hover:underline"
      >
        ← {journeyName}
      </Link>
      <h1 className="text-xl font-semibold text-primary">Leaderboard</h1>
      <LeaderboardView
        journeyId={id}
        period={period}
        periodStart={periodStart}
        periodLabel={periodLabel}
        rankings={rankings}
      />
    </div>
  );
}
