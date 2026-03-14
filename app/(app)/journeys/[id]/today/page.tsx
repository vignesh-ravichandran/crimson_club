/**
 * Today screen: daily log for this journey. GET daily?date=, dimension inputs (2–5), reflection, PUT save.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import { todayInTimezone } from "@/lib/date-utils";
import { TodayForm } from "@/components/domain/TodayForm";
import type {
  JourneyResponse,
  DimensionResponse,
  JourneyVisibleLabelsResponse,
} from "@/lib/types/api";
import type { DailyEntryResponse, DimensionValueResponse } from "@/lib/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchJourneyDetail(
  id: string,
  cookie: string
): Promise<{
  journey: JourneyResponse;
  dimensions: DimensionResponse[];
  visibleLabels: JourneyVisibleLabelsResponse;
} | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/journeys/${id}`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchDaily(
  journeyId: string,
  date: string,
  cookie: string
): Promise<{
  entry: DailyEntryResponse | null;
  dimensionValues: DimensionValueResponse[];
} | null> {
  const base = await getBaseUrl();
  const res = await fetch(
    `${base}/api/journeys/${journeyId}/daily?date=${date}`,
    { cache: "no-store", headers: { cookie } }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function TodayPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const cookie = await getCookieHeader();
  const journeyData = await fetchJourneyDetail(id, cookie);
  if (!journeyData) notFound();

  const today = todayInTimezone(user.timezone);
  const dailyData = await fetchDaily(id, today, cookie);

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
