/**
 * Insights: charts (daily score trend, dimension radar) and leaderboard section.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import { InsightsCharts } from "@/components/domain/InsightsCharts";

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

export default async function InsightsPage({ params }: PageProps) {
  const { id } = await params;
  const cookie = await getCookieHeader();
  const journeyName = await fetchJourneyName(id, cookie);
  if (!journeyName) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Link
        href={`/journeys/${id}`}
        className="text-sm text-brand-crimson hover:underline"
      >
        ← {journeyName}
      </Link>
      <h1 className="text-xl font-semibold text-primary">Insights</h1>
      <InsightsCharts journeyId={id} journeyName={journeyName} />
    </div>
  );
}
