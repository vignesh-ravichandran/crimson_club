/**
 * Goals screen: weekly and monthly goal. GET goals, create (POST), set outcome (PATCH). 7-day edit rule.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import {
  getCurrentWeekPeriod,
  getCurrentMonthPeriod,
  isWithinOutcomeEditWindow,
} from "@/lib/date-utils";
import { GoalsForm } from "@/components/domain/GoalsForm";
import type { GoalResponse } from "@/lib/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
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

async function fetchGoal(
  journeyId: string,
  goalType: "weekly" | "monthly",
  periodStart: string,
  cookie: string
): Promise<GoalResponse | null> {
  const base = await getBaseUrl();
  const res = await fetch(
    `${base}/api/journeys/${journeyId}/goals?goalType=${goalType}&periodStart=${periodStart}`,
    { cache: "no-store", headers: { cookie } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.goal ?? null;
}

export default async function GoalsPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const cookie = await getCookieHeader();
  const journeyName = await fetchJourneyName(id, cookie);
  if (!journeyName) notFound();

  const week = getCurrentWeekPeriod(user.timezone);
  const month = getCurrentMonthPeriod(user.timezone);

  const [weeklyGoal, monthlyGoal] = await Promise.all([
    fetchGoal(id, "weekly", week.periodStart, cookie),
    fetchGoal(id, "monthly", month.periodStart, cookie),
  ]);

  const canEditWeeklyOutcome =
    weeklyGoal != null &&
    isWithinOutcomeEditWindow(weeklyGoal.periodEnd, user.timezone);
  const canEditMonthlyOutcome =
    monthlyGoal != null &&
    isWithinOutcomeEditWindow(monthlyGoal.periodEnd, user.timezone);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <Link
        href={`/journeys/${id}`}
        className="text-sm text-brand-crimson hover:underline"
      >
        ← {journeyName}
      </Link>
      <h1 className="text-xl font-semibold text-primary">Goals</h1>

      <GoalsForm
        journeyId={id}
        weeklyGoal={weeklyGoal}
        monthlyGoal={monthlyGoal}
        weekPeriod={week}
        monthPeriod={month}
        canEditWeeklyOutcome={canEditWeeklyOutcome}
        canEditMonthlyOutcome={canEditMonthlyOutcome}
        timezone={user.timezone}
      />
    </div>
  );
}
