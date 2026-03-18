/**
 * Insights: charts (daily score trend, dimension radar). Uses server data layer (no self-fetch) for Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyDetail } from "@/lib/data/journeys";
import { InsightsCharts } from "@/components/domain/InsightsCharts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InsightsPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();
  const detail = await getJourneyDetail(id, user.id);
  if (!detail) notFound();
  const journeyName = detail.journey.name;

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
