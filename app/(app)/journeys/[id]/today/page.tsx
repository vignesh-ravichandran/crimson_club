/**
 * Today screen: daily log for this journey. Uses server data layer (no fetch to own API) so it works on Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { todayInTimezone } from "@/lib/date-utils";
import { getJourneyDetail } from "@/lib/data/journeys";
import { getDailyData } from "@/lib/data/daily";
import { TodayForm } from "@/components/domain/TodayForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TodayPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const today = todayInTimezone(user.timezone);
  const [journeyData, dailyData] = await Promise.all([
    getJourneyDetail(id, user.id),
    getDailyData(id, user.id, today),
  ]);
  if (!journeyData) notFound();

  const { journey, dimensions, visibleLabels } = journeyData;
  const entry = dailyData?.entry ?? null;
  const dimensionValues = dailyData?.dimensionValues ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/journeys/${id}`}
          className="text-sm text-brand-crimson hover:underline"
        >
          ← {journey.emoji} {journey.name}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-primary">Log today</h1>

      <TodayForm
        journeyId={id}
        dimensions={dimensions}
        visibleLabels={visibleLabels}
        initialDate={today}
        initialEntry={entry}
        initialDimensionValues={dimensionValues}
        timezone={user.timezone}
      />
    </div>
  );
}
