/**
 * Lessons: list with optional filters (dimensionId, sourceType); form to add lesson.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import type {
  JourneyResponse,
  DimensionResponse,
  LessonResponse,
} from "@/lib/types/api";
import { LessonsView } from "@/components/domain/LessonsView";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dimensionId?: string; sourceType?: string }>;
}

async function fetchJourneyWithDimensions(
  id: string,
  cookie: string
): Promise<{
  journey: JourneyResponse;
  dimensions: DimensionResponse[];
} | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/journeys/${id}`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { journey: data.journey, dimensions: data.dimensions ?? [] };
}

async function fetchLessons(
  journeyId: string,
  cookie: string,
  dimensionId?: string,
  sourceType?: string
): Promise<LessonResponse[]> {
  const base = await getBaseUrl();
  const params = new URLSearchParams();
  if (dimensionId) params.set("dimensionId", dimensionId);
  if (sourceType) params.set("sourceType", sourceType);
  const res = await fetch(
    `${base}/api/journeys/${journeyId}/lessons?${params.toString()}`,
    { cache: "no-store", headers: { cookie } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.lessons ?? [];
}

export default async function LessonsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { dimensionId, sourceType } = await searchParams;
  const cookie = await getCookieHeader();
  const [journeyData, lessons] = await Promise.all([
    fetchJourneyWithDimensions(id, cookie),
    fetchLessons(id, cookie, dimensionId, sourceType),
  ]);
  if (!journeyData) notFound();
  const { journey, dimensions } = journeyData;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Link
        href={`/journeys/${id}`}
        className="text-sm text-brand-crimson hover:underline"
      >
        ← {journey.name}
      </Link>
      <h1 className="text-xl font-semibold text-primary">Lessons</h1>
      <LessonsView
        key={`${id}-${dimensionId ?? ""}-${sourceType ?? ""}`}
        journeyId={id}
        dimensions={dimensions}
        initialLessons={lessons}
        initialDimensionId={dimensionId ?? ""}
        initialSourceType={sourceType ?? ""}
      />
    </div>
  );
}
