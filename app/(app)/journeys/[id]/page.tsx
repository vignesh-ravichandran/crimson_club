/**
 * Journey detail: dimensions, visible labels, actions. Uses server data layer directly (no fetch to own API) so it works on Cloudflare Workers.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneyDetail } from "@/lib/data/journeys";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JourneyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) notFound();
  const data = await getJourneyDetail(id, user.id);

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

      {(journey.whyExists ?? journey.successVision ?? journey.whatMattersMost ?? journey.whatShouldNotDistract ?? journey.strengthsToPlayTo) && (
        <section className="rounded-lg border border-border-default bg-subtle p-4">
          <h2 className="text-sm font-medium text-tertiary">Purpose</h2>
          <div className="mt-2 space-y-1 text-sm text-secondary">
            {journey.whyExists && <p><span className="font-medium text-tertiary">Why it exists:</span> {journey.whyExists}</p>}
            {journey.successVision && <p><span className="font-medium text-tertiary">Success looks like:</span> {journey.successVision}</p>}
            {journey.whatMattersMost && <p><span className="font-medium text-tertiary">What matters most:</span> {journey.whatMattersMost}</p>}
            {journey.whatShouldNotDistract && <p><span className="font-medium text-tertiary">What should not distract:</span> {journey.whatShouldNotDistract}</p>}
            {journey.strengthsToPlayTo && <p><span className="font-medium text-tertiary">Strengths to play to:</span> {journey.strengthsToPlayTo}</p>}
          </div>
          <Link href="/read-through" className="mt-3 inline-block text-xs text-brand-crimson hover:underline">Read through all journeys →</Link>
        </section>
      )}

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
                {d.description && (
                  <p className="mt-2 text-sm text-secondary">{d.description}</p>
                )}
                {(d.whyMatters ?? d.whatGoodLooksLike ?? d.howHelpsJourney ?? d.strengthGuidance) && (
                  <div className="mt-2 space-y-0.5 text-xs text-tertiary">
                    {d.whyMatters && <p><span className="font-medium">Why it matters:</span> {d.whyMatters}</p>}
                    {d.whatGoodLooksLike && <p><span className="font-medium">Good looks like:</span> {d.whatGoodLooksLike}</p>}
                    {d.howHelpsJourney && <p><span className="font-medium">How it helps:</span> {d.howHelpsJourney}</p>}
                    {d.strengthGuidance && <p><span className="font-medium">Strength guidance:</span> {d.strengthGuidance}</p>}
                  </div>
                )}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
