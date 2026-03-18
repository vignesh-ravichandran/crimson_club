/**
 * Read-through: list all journeys with full descriptions and dimensions. Uses server data layer directly (no fetch to own API) so it works on Cloudflare Workers.
 */
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getJourneysForUser, getJourneyDetail } from "@/lib/data/journeys";

export default async function ReadThroughPage() {
  const user = await getSessionUser();
  const journeys = user
    ? await getJourneysForUser(user.id, user.primaryJourneyId)
    : [];
  const details =
    user &&
    (await Promise.all(
      journeys.map((j) => getJourneyDetail(j.id, user.id))
    ));

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4">
      <div>
        <h1 className="text-xl font-semibold text-primary">Read through</h1>
        <p className="mt-1 text-sm text-secondary">
          Your journeys and dimensions — read through to refresh your thought process.
        </p>
      </div>

      {journeys.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-subtle p-6 text-center">
          <p className="text-secondary">No journeys yet.</p>
          <Link href="/journeys/new" className="mt-3 inline-block text-brand-crimson hover:underline">
            Create your first journey →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {(details ?? []).map((data) => {
            if (!data) return null;
            const { journey, dimensions } = data;
            const sortedDims = [...dimensions].sort((a, b) => a.position - b.position);
            return (
              <section
                key={journey.id}
                className="rounded-lg border border-border-default bg-surface p-5"
              >
                <Link
                  href={`/journeys/${journey.id}`}
                  className="text-brand-crimson hover:underline"
                >
                  Open journey →
                </Link>
                <div className="mt-3 flex items-start gap-3">
                  <span className="text-3xl">{journey.emoji}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-primary">{journey.name}</h2>
                    {journey.description && (
                      <p className="mt-2 text-sm text-secondary whitespace-pre-wrap">
                        {journey.description}
                      </p>
                    )}
                    {(journey.whyExists ?? journey.successVision ?? journey.whatMattersMost ?? journey.whatShouldNotDistract ?? journey.strengthsToPlayTo) && (
                      <div className="mt-3 space-y-1 text-sm text-secondary">
                        {journey.whyExists && (
                          <p><span className="font-medium text-tertiary">Why it exists:</span> {journey.whyExists}</p>
                        )}
                        {journey.successVision && (
                          <p><span className="font-medium text-tertiary">Success looks like:</span> {journey.successVision}</p>
                        )}
                        {journey.whatMattersMost && (
                          <p><span className="font-medium text-tertiary">What matters most:</span> {journey.whatMattersMost}</p>
                        )}
                        {journey.whatShouldNotDistract && (
                          <p><span className="font-medium text-tertiary">What should not distract:</span> {journey.whatShouldNotDistract}</p>
                        )}
                        {journey.strengthsToPlayTo && (
                          <p><span className="font-medium text-tertiary">Strengths to play to:</span> {journey.strengthsToPlayTo}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="mt-5 text-sm font-medium text-tertiary">Dimensions</h3>
                <ul className="mt-2 space-y-4">
                  {sortedDims.map((d) => (
                    <li
                      key={d.id}
                      className="rounded border border-border-default bg-subtle p-3"
                    >
                      <span className="mr-2">{d.emoji}</span>
                      <span className="font-medium text-primary">{d.name}</span>
                      <span className="text-sm text-secondary">
                        {" "}· weight {d.weight}
                        {d.isMandatory ? " · mandatory" : ""}
                      </span>
                      {d.description && (
                        <p className="mt-2 text-sm text-secondary whitespace-pre-wrap">
                          {d.description}
                        </p>
                      )}
                      {(d.whyMatters ?? d.whatGoodLooksLike ?? d.howHelpsJourney ?? d.strengthGuidance) && (
                        <div className="mt-2 space-y-1 text-xs text-tertiary">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
