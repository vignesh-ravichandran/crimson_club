/**
 * Weekly review screen: GET review for week, done checkbox + notes, PUT on save.
 * Uses server data layer (no self-fetch) for Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyDetail } from "@/lib/data/journeys";
import { weekStartForDate, todayInTimezone } from "@/lib/date-utils";
import { WeeklyReviewForm } from "@/components/domain/WeeklyReviewForm";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ weekStart?: string }>;
}

export default async function WeeklyReviewPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { weekStart: queryWeekStart } = await searchParams;
  const user = await getSessionUser();
  if (!user) notFound();

  const detail = await getJourneyDetail(id, user.id);
  if (!detail) notFound();
  const journeyName = detail.journey.name;

  const today = todayInTimezone(user.timezone);
  const weekStart =
    queryWeekStart && /^\d{4}-\d{2}-\d{2}$/.test(queryWeekStart)
      ? queryWeekStart
      : weekStartForDate(today, user.timezone);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Link
        href={`/journeys/${id}`}
        className="text-sm text-brand-crimson hover:underline"
      >
        ← {journeyName}
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Weekly review</h1>
        <Link
          href={`/journeys/${id}/weekly-reviews`}
          className="text-sm text-secondary hover:underline"
        >
          Past reviews
        </Link>
      </div>

      <WeeklyReviewForm
        journeyId={id}
        weekStart={weekStart}
        journeyName={journeyName}
      />
    </div>
  );
}
