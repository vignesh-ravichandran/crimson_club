/**
 * Journey detail: GET /api/journeys/[id]. Dimensions, visible labels, actions (Log today, Review, Invite, etc.).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import type {
  JourneyResponse,
  DimensionResponse,
  JourneyVisibleLabelsResponse,
} from "@/lib/types/api";

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

export default async function JourneyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [user, cookie] = await Promise.all([
    getSessionUser(),
    getCookieHeader(),
  ]);
  const data = await fetchJourneyDetail(id, cookie);

  if (!data) notFound();

  const { journey, dimensions, visibleLabels } = data;
  const showInvite =
    journey.visibility === "private" &&
    user?.id != null &&
    journey.creatorId === user.id;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{journey.emoji}</span>
        <div>
          <h1 className="text-xl font-semibold text-primary">{journey.name}</h1>
          {journey.description && (
            <p className="text-sm text-secondary">{journey.description}</p>
          )}
          <p className="text-xs text-tertiary">
            {journey.visibility} · Started {journey.startDate}
          </p>
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/journeys/${id}/today`}
          className="rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive"
        >
          Log today
        </Link>
        <Link
          href={`/journeys/${id}/weekly-review`}
          className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-border-crimson"
        >
          Weekly review
        </Link>
        <Link
          href={`/journeys/${id}/goals`}
          className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-border-crimson"
        >
          Goals
        </Link>
        <Link
          href={`/journeys/${id}/leaderboard`}
          className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-border-crimson"
        >
          Leaderboard
        </Link>
        <Link
          href={`/journeys/${id}/lessons`}
          className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-border-crimson"
        >
          Lessons
        </Link>
        <Link
          href={`/journeys/${id}/insights`}
          className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-border-crimson"
        >
          Insights
        </Link>
        {showInvite && (
          <Link
            href={`/journeys/${id}/invite`}
            className="rounded border border-border-default bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-border-crimson"
          >
            Invite
          </Link>
        )}
      </div>

      {/* Dimensions (read-only) */}
      <section>
        <h2 className="text-sm font-medium text-tertiary">Dimensions</h2>
        <p className="text-xs text-secondary mt-1">
          Scale: {visibleLabels.labelLow} → {visibleLabels.labelMedium} → {visibleLabels.labelHigh} → {visibleLabels.labelExcellent}
        </p>
        <ul className="mt-3 space-y-2">
          {dimensions
            .sort((a, b) => a.position - b.position)
            .map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-border-default bg-surface p-3"
              >
                <span className="mr-2">{d.emoji}</span>
                <span className="font-medium text-primary">{d.name}</span>
                <span className="text-sm text-secondary">
                  {" "}· weight {d.weight}
                  {d.isMandatory ? " · mandatory" : ""}
                </span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
