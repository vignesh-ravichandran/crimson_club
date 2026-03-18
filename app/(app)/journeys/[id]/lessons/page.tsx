/**
 * Lessons: list with optional filters (dimensionId, sourceType); form to add lesson. Uses server data layer (no self-fetch) for Cloudflare.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyDetail } from "@/lib/data/journeys";
import { getLessons } from "@/lib/data/lessons";
import { LessonsView } from "@/components/domain/LessonsView";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dimensionId?: string; sourceType?: string }>;
}

export default async function LessonsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { dimensionId, sourceType } = await searchParams;
  const user = await getSessionUser();
  if (!user) notFound();

  const detail = await getJourneyDetail(id, user.id);
  if (!detail) notFound();
  const { journey, dimensions } = detail;
  const lessonsList = await getLessons(id, user.id, dimensionId, sourceType);

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
        initialLessons={lessonsList}
        initialDimensionId={dimensionId ?? ""}
        initialSourceType={sourceType ?? ""}
      />
    </div>
  );
}
