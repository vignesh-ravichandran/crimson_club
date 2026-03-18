/**
 * Leaderboard: period=weekly|monthly and periodStart. Uses server data layer (no self-fetch) for Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import {
  getCurrentWeekPeriod,
  getCurrentMonthPeriod,
} from "@/lib/date-utils";
import { getJourneyDetail } from "@/lib/data/journeys";
import { getLeaderboard } from "@/lib/data/leaderboard";
import { LeaderboardView } from "@/components/domain/LeaderboardView";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; periodStart?: string }>;
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { period: queryPeriod, periodStart: queryPeriodStart } = await searchParams;
  const user = await getSessionUser();
  if (!user) notFound();

  const detail = await getJourneyDetail(id, user.id);
  if (!detail) notFound();

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

  const rankings = await getLeaderboard(
    id,
    user.id,
    period,
    periodStart,
    user.timezone
  );

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
        ← {detail.journey.name}
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
