/**
 * Home screen: primary journey, today state, other journeys, pending backfill, pending weekly reviews.
 * Contract: api-contracts §4.8; frontend-design §8.1, §8.2.
 */
import Link from "next/link";
import { getBaseUrl, getCookieHeader } from "@/lib/server-request";
import type { HomeResponse } from "@/lib/types/api";

async function fetchHome(): Promise<HomeResponse | null> {
  const base = await getBaseUrl();
  const cookie = await getCookieHeader();
  const res = await fetch(`${base}/api/home`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return null;
  return res.json();
}

export default async function AppHomePage() {
  const data = await fetchHome();

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <p className="text-secondary">Could not load home data.</p>
      </div>
    );
  }

  const {
    primaryJourney,
    primaryTodayState,
    otherJourneys,
    pendingBackfillCount,
    pendingWeeklyReviews,
  } = data;

  const hasEntryToday = primaryTodayState?.entry != null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-xl font-semibold text-primary">Home</h1>

      {/* Primary journey hero */}
      {primaryJourney ? (
        <section className="rounded-lg border border-border-default bg-surface p-4">
          <h2 className="text-sm font-medium text-tertiary">Primary journey</h2>
          <Link
            href={`/journeys/${primaryJourney.id}`}
            className="mt-2 flex items-center gap-3 rounded border border-border-default bg-surface p-3 hover:border-border-crimson hover:bg-crimsonSubtle"
          >
            <span className="text-2xl">{primaryJourney.emoji}</span>
            <div>
              <p className="font-medium text-primary">{primaryJourney.name}</p>
              <p className="text-sm text-secondary">
                {hasEntryToday ? "Logged today" : "Not logged yet"}
              </p>
            </div>
          </Link>
          <Link
            href={hasEntryToday ? `/journeys/${primaryJourney.id}/today` : `/journeys/${primaryJourney.id}/today`}
            className="mt-3 inline-block rounded bg-brand-crimson px-4 py-2 text-sm font-medium text-onCrimson hover:bg-brand-crimsonActive"
          >
            {hasEntryToday ? "View / edit today" : "Log today"}
          </Link>
        </section>
      ) : (
        <section className="rounded-lg border border-border-default bg-subtle p-4">
          <p className="text-secondary">No primary journey set.</p>
          <Link
            href="/journeys"
            className="mt-2 inline-block text-brand-crimson hover:underline"
          >
            Browse journeys →
          </Link>
        </section>
      )}

      {/* Other journeys */}
      {otherJourneys.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-tertiary">Other journeys</h2>
          <ul className="mt-2 space-y-2">
            {otherJourneys.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/journeys/${j.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border-default bg-surface p-3 hover:border-border-crimson"
                >
                  <span className="text-xl">{j.emoji}</span>
                  <span className="font-medium text-primary">{j.name}</span>
                  {j.participantCount != null && (
                    <span className="text-sm text-secondary">{j.participantCount} participants</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Pending backfill */}
      {pendingBackfillCount > 0 && (
        <section className="rounded-lg border border-border-default bg-semantic-warningBg p-4">
          <p className="text-sm font-medium text-semantic-warning">
            {pendingBackfillCount} day{pendingBackfillCount !== 1 ? "s" : ""} to log (within last 7 days).
          </p>
          <Link
            href="/journeys"
            className="mt-2 inline-block text-sm text-brand-crimson hover:underline"
          >
            Go to journeys →
          </Link>
        </section>
      )}

      {/* Pending weekly reviews */}
      {pendingWeeklyReviews.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-tertiary">Pending weekly reviews</h2>
          <ul className="mt-2 space-y-2">
            {pendingWeeklyReviews.map((p) => (
              <li key={`${p.journeyId}-${p.weekStart}`}>
                <Link
                  href={`/journeys/${p.journeyId}/weekly-review?weekStart=${p.weekStart}`}
                  className="block rounded-lg border border-border-default bg-surface p-3 text-primary hover:border-border-crimson"
                >
                  Week of {p.weekStart} — Review
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!primaryJourney && otherJourneys.length === 0 && (
        <p className="text-secondary">Create or join a journey to get started.</p>
      )}
    </div>
  );
}
