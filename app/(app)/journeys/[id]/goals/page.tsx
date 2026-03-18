/**
 * Goals screen: weekly and monthly goal. Uses server data layer (no fetch to own API) so it works on Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyDetail } from "@/lib/data/journeys";
import { getGoal } from "@/lib/data/goals";
import {
  getCurrentWeekPeriod,
  getCurrentMonthPeriod,
  isWithinOutcomeEditWindow,
} from "@/lib/date-utils";
import { GoalsForm } from "@/components/domain/GoalsForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalsPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const week = getCurrentWeekPeriod(user.timezone);
  const month = getCurrentMonthPeriod(user.timezone);
  const [journeyData, weeklyGoal, monthlyGoal] = await Promise.all([
    getJourneyDetail(id, user.id),
    getGoal(id, user.id, "weekly", week.periodStart),
    getGoal(id, user.id, "monthly", month.periodStart),
  ]);
  if (!journeyData) notFound();
  const journeyName = journeyData.journey.name;

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
